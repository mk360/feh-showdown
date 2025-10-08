import {
  useContext,
  useEffect,
  useMemo,
  useState
} from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { useForm } from "react-hook-form";
import { getSkillUrl } from "../data/skill-icon-dex";
import { CharacterMoveset } from "../interfaces/moveset";
import STATS from "../stats";
import { getExtraStats, getLevel40Stats, withMerges } from "../stats/convert-to-level-40";
import TeamContext from "../team-context";
import EMPTY_CHARACTER from "../utils/empty-character-slot";
import fetchMovesets from "../utils/fetch-moveset";
import { formatName } from "../utils/strings";
import Summary from "./summary";
import TeamPreview from "./team-preview";
import UnitList from "./unit-list";

interface SkillWithDescription {
  name: string;
  description: string;
}

interface SkillList {
  weapons: (SkillWithDescription & { might: number })[];
  assists: SkillWithDescription[];
  specials: (SkillWithDescription & { cooldown: number })[];
  A: SkillWithDescription[];
  B: SkillWithDescription[];
  C: SkillWithDescription[];
  S: SkillWithDescription[];
}

type StatChangeFields = {
  asset: FEH_Stat | "";
  flaw: FEH_Stat | "";
};

export default function Tab() {
  const [temporaryChoice, setTemporaryChoice] = useState("");
  const [moveset, setMoveset] = useState<CharacterMoveset>(null);
  const { teamPreview, setTeamPreview, tab } = useContext(TeamContext);
  const [subTab, setSubTab] = useState<"list" | "detail">();
  const {
    register: registerMoveset,
    handleSubmit: handleSubmitMoveset,
    getValues,
    resetField,
    setValue,

  } = useForm<{
    [k in keyof (SkillList & { merges: number })]: string;
  } & StatChangeFields>({
    mode: "onChange",
    defaultValues: {
      weapons: "",
      assists: "",
      specials: "",
      A: "",
      B: "",
      C: "",
      S: "",
      merges: "0",
    },
  });

  const skillsData = useMemo(() => {
    const unitName = teamPreview[tab]?.name;
    if (!unitName || !moveset) {
      return {
        weapons: [],
        assists: [],
        specials: [],
        A: [],
        B: [],
        C: [],
        S: []
      }
    }
    return {
      weapons: [{ name: "No Weapon", description: "", might: 0 }]
              .concat(moveset.exclusiveSkills.weapons || [])
              .concat(moveset.commonSkills.weapons || []),
      assists: [{ name: "No Assist", description: "" }]
              .concat(moveset.exclusiveSkills.assists)
              .concat(moveset.commonSkills.assists),
      specials: [{ name: "No Special", description: "", cooldown: 0 }]
              .concat(moveset.exclusiveSkills.specials)
              .concat(moveset.commonSkills.specials),
      A: [{ name: "No A", description: "" }]
              .concat(moveset.exclusiveSkills.A)
              .concat(moveset.commonSkills.A),
      B: [{ name: "No B", description: "" }]
              .concat(moveset.exclusiveSkills.B)
              .concat(moveset.commonSkills.B),
      C: [{ name: "No C", description: "" }]
              .concat(moveset.exclusiveSkills.C)
              .concat(moveset.commonSkills.C),
      S: [{ name: "No S", description: "" }].concat(moveset.commonSkills.S),
    };
  }, [moveset, tab, teamPreview[tab]?.name]);

  useEffect(() => {
    if (teamPreview[tab]?.name) {
      fetchMovesets(teamPreview[tab].name).then((moveset) => {
        const tabData = teamPreview[tab];
        setTemporaryChoice(teamPreview[tab].name);
        setValue("merges", tabData.merges.toString());
        setValue("asset", tabData.asset);
        setValue("flaw", tabData.flaw);
        setValue("weapons", tabData.weapon);
        setValue("assists", tabData.assist);
        setValue("specials", tabData.special);
        setValue("A", tabData.A);
        setValue("B", tabData.B);
        setValue("C", tabData.C);
        setValue("S", tabData.S);
        setMoveset(moveset);
      });
    }
  }, [teamPreview[tab]?.name]);

  useEffect(() => {
    if (teamPreview[tab]?.name) {
      setSubTab("detail");
    } else {
      setSubTab("list");
    }
  }, [teamPreview[tab]?.name]);

  const getAlteredStats = function () {
    const asset = getValues("asset");
    const flaw = getValues("flaw");

    if (asset && flaw && asset !== flaw) {
      return {
        asset: asset as FEH_Stat,
        flaw: flaw as FEH_Stat,
      };
    }

    return {
      asset: "" as const,
      flaw: "" as const
    };
  };

  const alteredStats = getAlteredStats();

  const stats = !temporaryChoice
    ? {
        atk: 0,
        hp: 0,
        spd: 0,
        def: 0,
        res: 0,
      }
    : getLevel40Stats({
       character: temporaryChoice,
       asset: alteredStats.asset,
       flaw: alteredStats.flaw,
    });

  const statsWithMerges = !temporaryChoice
    ? {
        atk: 0,
        hp: 0,
        spd: 0,
        def: 0,
        res: 0,
      }
    : withMerges(stats, +getValues("merges"), alteredStats.asset, alteredStats.flaw);

    const extraStats = getExtraStats({
      weapon: getValues("weapons"),
      assist: getValues("assists"),
      special: getValues("specials"),
      A: getValues("A"),
      B: getValues("B"),
      C: getValues("C"),
      S: getValues("S"),
    });

    for (let key in extraStats) {
      statsWithMerges[key] += extraStats[key];
    }

  return (
    <>
      <div class={subTab === "detail" ? "hide" : ""}>
        <UnitList
          onUnitClick={(e) => {
            let target = e.target as HTMLElement;
            while (target.nodeName !== "TR") {
              target = target.parentElement;
            }
            fetchMovesets(target.id).then((moveset) => {
              setTemporaryChoice(target.id);
              const copy = [...teamPreview];
              const initialStats = getLevel40Stats({
                character: target.id,
                asset: "",
                flaw: "",
              });
              copy[tab] = {
                name: target.id,
                merges: 0,
                asset: "",
                flaw: "",
                stats: initialStats,
                weapon: "",
                assist: "",
                special: "",
                A: "",
                B: "",
                C: "",
                S: "",
              };
              setTeamPreview(copy);
              setSubTab("detail");
              setMoveset(moveset);
            });
          }}
          index={tab}
        />
      </div>
      <div
        onChange={handleSubmitMoveset((data) => {
          if (data.asset === data.flaw) {
            setValue("asset", "");
            setValue("flaw", "");
          }
          const alteredStats = getAlteredStats();
          const baseStats = getLevel40Stats({
                character: temporaryChoice,
                asset: alteredStats.asset,
                flaw: alteredStats.flaw,
              });

          const stats = !temporaryChoice
            ? {
                atk: 0,
                hp: 0,
                spd: 0,
                def: 0,
                res: 0,
              }
            : withMerges(baseStats, +getValues("merges"), alteredStats.asset, alteredStats.flaw);

            const extraStats = getExtraStats({
            weapon: getValues("weapons"),
            assist: getValues("assists"),
            special: getValues("specials"),
            A: getValues("A"),
            B: getValues("B"),
            C: getValues("C"),
            S: getValues("S"),
          });

          for (let key in extraStats) {
            stats[key] += extraStats[key];
          }
          const copy: StoredHero[] = [];
          for (let member of teamPreview) {
            copy.push(member);
          }
          copy[tab] = {
            name: temporaryChoice,
            asset: "",
            flaw: "",
            weapon: data.weapons,
            assist: data.assists,
            special: data.specials,
            merges: +data.merges,
            A: data.A,
            B: data.B,
            C: data.C,
            S: data.S,
            ...getAlteredStats(),
            stats,
          };
          setTeamPreview(copy);
        })}
        class={
          (subTab === "list" ? "hide " : "") + "detail-list"
        }
      >
        <div class="hero-portrait">
          <h2>{teamPreview[tab].name}</h2>
          <img src={`/teambuilder/portraits/${formatName(teamPreview[tab].name ?? "")}.webp`} />
          <div />
        </div>
        <div class="stats">
          <h2>Stats and Traits</h2>
          <table>
            <tbody>
              <tr>
                <td>HP</td>
                <td>{!!temporaryChoice && statsWithMerges.hp}</td>
                <td>
                  <input
                    class="stat-input"
                    id={`flaw-hp`}
                    type="radio"
                    {...registerMoveset("flaw")}
                    value="hp"
                  />
                  <label class="flaw" for={`flaw-hp`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`asset-hp`}
                    type="radio"
                    {...registerMoveset("asset")}
                    value="hp"
                  />
                  <label class="asset" for={`asset-hp`}>
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Atk</td>
                <td>{!!temporaryChoice && statsWithMerges.atk}</td>
                <td>
                  <input
                    class="stat-input"
                    id={`flaw-atk`}
                    type="radio"
                    {...registerMoveset("flaw")}
                    value="atk"
                  />
                  <label class="flaw" for={`flaw-atk`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`asset-atk`}
                    type="radio"
                    {...registerMoveset("asset")}
                    value="atk"
                  />
                  <label class="asset" for="asset-atk">
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Spd</td>
                <td>{!!temporaryChoice && statsWithMerges.spd}</td>
                <td>
                  <input
                    class="stat-input"
                    id={`flaw-spd`}
                    type="radio"
                    {...registerMoveset("flaw")}
                    value="spd"
                  />
                  <label class="flaw" for={`flaw-spd`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`asset-spd`}
                    type="radio"
                    {...registerMoveset("asset")}
                    value="spd"
                  />
                  <label class="asset" for={`asset-spd`}>
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Def</td>
                <td>{!!temporaryChoice && statsWithMerges.def}</td>
                <td>
                  <input
                    class="stat-input"
                    id={`flaw-def`}
                    type="radio"
                    {...registerMoveset("flaw")}
                    value="def"
                  />
                  <label class="flaw" for={`flaw-def`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`asset-def`}
                    type="radio"
                    {...registerMoveset("asset")}
                    value="def"
                  />
                  <label class="asset" for={`asset-def`}>
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Res</td>
                <td>{!!temporaryChoice && statsWithMerges.res}</td>
                <td>
                  <input
                    class="stat-input"
                    id={`flaw-res`}
                    type="radio"
                    {...registerMoveset("flaw")}
                    value="res"
                  />
                  <label class="flaw" for={`flaw-res`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`asset-res`}
                    type="radio"
                    {...registerMoveset("asset")}
                    value="res"
                  />
                  <label class="asset" for={`asset-res`}>
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td colSpan={2}>
                   <input
                    class="stat-input"
                    id={`neutral`}
                    type="radio"
                    onClick={() => {
                      setValue("asset", "");
                      setValue("flaw", "");
                    }}
                    value=""
                  />
                  <label for={`neutral`}>
                    Neutral
                  </label>
                </td>
              </tr>
              <tr>
                <td>Merges</td>
                <td>{getValues("merges")}</td>
                <td colSpan={3}>
                  <input
                    style={{ width: "100%" }}
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    {...registerMoveset("merges")}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="weapon-list">
          <h2>
            <img class="game-asset" src="/teambuilder/weapon-icon.png" /> Weapons
          </h2>
          {skillsData.weapons.map((weaponData, i) => {
            return (
              <Fragment key={weaponData.name}>
                <input
                  value={i === 0 ? "" : weaponData.name}
                  id={`weapon-${weaponData.name}`}
                  type="radio"
                  class="hide"
                  {...registerMoveset("weapons")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`weapon-${weaponData.name}`}
                >
                  <div>
                    <h3>
                      <img class="game-asset" src="/teambuilder/weapon-icon.png" />
                      {weaponData.name}
                    </h3>
                    {!!weaponData.might && <h4>{weaponData.might}</h4>}
                  </div>
                  {!!weaponData.description && <p>{weaponData.description}</p>}
                </label>
              </Fragment>
            );
          })}
        </div>
        <div class="assist-list">
          <h2>
            <img class="game-asset" src="/teambuilder/assist-icon.png" />
            Assists
          </h2>
          {skillsData.assists.map((assistData, i) => {
            return (
              <Fragment key={assistData.name}>
                <input
                  value={i === 0 ? "" : assistData.name}
                  id={`assists-${assistData.name}`}
                  type="radio"
                  class="hide"
                  {...registerMoveset("assists")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`assists-${assistData.name}`}
                >
                  <h3>
                    <img class="game-asset" src="/teambuilder/assist-icon.png" />
                    {assistData.name}
                  </h3>
                  {!!assistData.description && <p>{assistData.description}</p>}
                </label>
              </Fragment>
            );
          })}
        </div>
        <div class="specials-list">
          <h2>
            <img class="game-asset" src="/teambuilder/special-icon.png" />
            Specials
          </h2>
          {skillsData.specials.map((specialsData, i) => {
            return (
              <Fragment key={specialsData.name}>
                <input
                  value={i === 0 ? "" : specialsData.name}
                  id={`special-${specialsData.name}`}
                  type="radio"
                  class="hide"
                  {...registerMoveset("specials")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`special-${specialsData.name}`}
                >
                  <div>
                    <h3>
                    <img class="game-asset" src="/teambuilder/special-icon.png" />
                    {specialsData.name}
                  </h3>
                  {!!specialsData.cooldown && <h4>{specialsData.cooldown}</h4>}
                  </div>
                  {!!specialsData.description && (
                    <p>{specialsData.description}</p>
                  )}
                </label>
              </Fragment>
            );
          })}
        </div>
        <div class="passive-a-list">
          <h2>
            <img class="game-asset" src="/teambuilder/A.png" />
            Skill
          </h2>
          {skillsData.A.map((passive, i) => {
            return (
              <Fragment key={passive.name}>
                <input
                  value={i === 0 ? "" : passive.name}
                  id={`A-${passive.name}`}
                  type="radio"
                  class="hide"
                  {...registerMoveset("A")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`A-${passive.name}`}
                >
                  <h3>
                    {passive.name !== "No A" && (
                      <img
                        loading="lazy"
                        class="game-asset"
                        src={getSkillUrl(passive.name)}
                      />
                    )}
                    {passive.name}
                  </h3>
                  {!!passive.description && <p>{passive.description}</p>}
                </label>
              </Fragment>
            );
          })}
        </div>
        <div class="passive-b-list">
          <h2>
            <img class="game-asset" src="/teambuilder/B.png" />
            Skill
          </h2>
          {skillsData.B.map((passive, i) => {
            return (
              <Fragment key={passive.name}>
                <input
                  type="radio"
                  class="hide"
                  value={i === 0 ? "" : passive.name}
                  id={`B-${passive.name}`}
                  {...registerMoveset("B")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`B-${passive.name}`}
                >
                  <h3>
                    {passive.name !== "No B" && (
                      <img
                        loading="lazy"
                        class="game-asset"
                        src={getSkillUrl(passive.name)}
                      />
                    )}
                    {passive.name}
                  </h3>
                  {!!passive.description && <p>{passive.description}</p>}
                </label>
              </Fragment>
            );
          })}
        </div>
        <div class="passive-c-list">
          <h2>
            <img class="game-asset" src="/teambuilder/C.png" />
            Skill
          </h2>
          {skillsData.C.map((passive, i) => {
            return (
              <Fragment key={passive.name}>
                <input
                  type="radio"
                  class="hide"
                  value={i === 0 ? "" : passive.name}
                  id={`C-${passive.name}`}
                  {...registerMoveset("C")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`C-${passive.name}`}
                >
                  <h3>
                    {passive.name !== "No C" && (
                      <img
                        loading="lazy"
                        class="game-asset"
                        src={getSkillUrl(passive.name)}
                      />
                    )}
                    {passive.name}
                  </h3>
                  {!!passive.description && <p>{passive.description}</p>}
                </label>
              </Fragment>
            );
          })}
        </div>
        {/* {teamPreview.length >= 2 ? <div class="support">
          <h2>Supports</h2>
          <div class="support-table">
            <span>Summoner Support</span>
            <span />
            <select>
              <option>None</option>
              <option>C</option>
              <option>B</option>
              <option>A</option>
              <option>S</option>
            </select>
             
              <span>Ally Support</span>
              <select>
                <option>None</option>
                {teamPreview.filter((i) => i.name !== teamPreview[tab].name).map((choice) => (
                  <option key={choice.name}>{choice.name}</option>
                ))}
              </select>
              <select>
                <option>None</option>
                <option>C</option>
                <option>B</option>
                <option>A</option>
                <option>S</option>
              </select>
          </div>
        </div> : null} */}
        <div class="passive-s-list">
          <h2>Sacred Seal</h2>
          {skillsData.S.map((passive, i) => {
            return (
              <Fragment key={passive.name}>
                <input
                  value={i === 0 ? "" : passive.name}
                  id={`S-${passive.name}`}
                  type="radio"
                  class="hide"
                  {...registerMoveset("S")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`S-${passive.name}`}
                >
                  <h3>
                    {passive.name !== "No S" && (
                      <img
                        loading="lazy"
                        class="game-asset"
                        src={getSkillUrl(passive.name)}
                      />
                    )}
                    {passive.name}
                  </h3>
                  {!!passive.description && <p>{passive.description}</p>}
                </label>
              </Fragment>
            );
          })}
        </div>
        <div class="preview">
          <TeamPreview />
        </div>
        <div class="submit">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const copy = [...teamPreview];
              copy[tab] = EMPTY_CHARACTER;
              setTeamPreview(copy);
              setValue("asset", "");
              setValue("flaw", "");
              setSubTab("list");
            }}
          >
            Remove Unit
          </button>
          
        </div>
        <div class="moveset-summary">
          <h2>Summary</h2>
          <Summary data={teamPreview[tab]} />
        </div>
      </div>
    </>
  );
}
