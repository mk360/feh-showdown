import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { useForm } from "react-hook-form";
import { getSkillUrl } from "../data/skill-icon-dex";
import STATS from "../stats";
import { getExtraStats, getLevel40Stats, withMerges } from "../stats/convert-to-level-40";
import TeamContext from "../team-context";
import fetchMovesets from "../utils/fetch-moveset";
import { formatName } from "../utils/strings";
import Summary from "./summary";
import TeamPreview from "./team-preview";
import UnitList from "./unit-list";
import { CharacterMoveset } from "../interfaces/moveset";

const statLabels = ["hp", "atk", "spd", "def", "res"];

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
  [k in `${FEH_Stat}-change`]: "asset" | "flaw" | "neutral";
};

export default function Tab() {
  const [temporaryChoice, setTemporaryChoice] = useState("");
  const lastAbortController = useRef(new AbortController());
  const [moveset, setMoveset] = useState<CharacterMoveset>(null);
  const { teamPreview, setTeamPreview, tab } = useContext(TeamContext);
  const [subTab, setSubTab] = useState<"list" | "detail">();
  const {
    register: registerMoveset,
    handleSubmit: handleSubmitMoveset,
    getValues,
    setValue,
  } = useForm<{
    [k in keyof (SkillList & StatChangeFields & { merges: number })]: string;
  }>({
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
        setValue("hp-change", tabData.asset === "hp" ? "asset" : tabData.flaw === "hp" ? "flaw" : "");
        setValue("atk-change", tabData.asset === "atk" ? "asset" : tabData.flaw === "atk" ? "flaw" : "");
        setValue("spd-change", tabData.asset === "spd" ? "asset" : tabData.flaw === "spd" ? "flaw" : "");
        setValue("def-change", tabData.asset === "def" ? "asset" : tabData.flaw === "def" ? "flaw" : "");
        setValue("res-change", tabData.asset === "res" ? "asset" : tabData.flaw === "res" ? "flaw" : "");
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
    const asset = statLabels.find(
      (stat: FEH_Stat) => getValues(`${stat}-change`) === "asset"
    );
    const flaw = statLabels.find(
      (stat: FEH_Stat) => getValues(`${stat}-change`) === "flaw"
    );

    if (asset && flaw) {
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
          <h2>Stats</h2>
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
                    {...registerMoveset("hp-change")}
                    value="flaw"
                    disabled={[
                      getValues("atk-change"),
                      getValues("spd-change"),
                      getValues("def-change"),
                      getValues("res-change"),
                    ].includes("flaw")}
                  />
                  <label class="flaw" for={`flaw-hp`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`neutral-hp`}
                    type="radio"
                    {...registerMoveset("hp-change")}
                    value="neutral"
                  />
                  <label class="neutral" for={`neutral-hp`}>
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`asset-hp`}
                    type="radio"
                    {...registerMoveset("hp-change")}
                    disabled={[
                      getValues("atk-change"),
                      getValues("spd-change"),
                      getValues("def-change"),
                      getValues("res-change"),
                    ].includes("asset")}
                    value="asset"
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
                    {...registerMoveset("atk-change")}
                    disabled={[
                      getValues("hp-change"),
                      getValues("spd-change"),
                      getValues("def-change"),
                      getValues("res-change"),
                    ].includes("flaw")}
                    value="flaw"
                  />
                  <label class="flaw" for={`flaw-atk`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`neutral-atk`}
                    type="radio"
                    {...registerMoveset("atk-change")}
                    value="neutral"
                  />
                  <label class="neutral" for="neutral-atk">
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`asset-atk`}
                    type="radio"
                    {...registerMoveset("atk-change")}
                    value="asset"
                    disabled={[
                      getValues("hp-change"),
                      getValues("spd-change"),
                      getValues("def-change"),
                      getValues("res-change"),
                    ].includes("asset")}
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
                    {...registerMoveset("spd-change")}
                    value="flaw"
                    disabled={[
                      getValues("hp-change"),
                      getValues("atk-change"),
                      getValues("def-change"),
                      getValues("res-change"),
                    ].includes("flaw")}
                  />
                  <label class="flaw" for={`flaw-spd`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`neutral-spd`}
                    type="radio"
                    {...registerMoveset("spd-change")}
                    value="neutral"
                  />
                  <label class="neutral" for={`neutral-spd`}>
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`asset-spd`}
                    type="radio"
                    {...registerMoveset("spd-change")}
                    value="asset"
                    disabled={[
                      getValues("hp-change"),
                      getValues("atk-change"),
                      getValues("def-change"),
                      getValues("res-change"),
                    ].includes("asset")}
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
                    {...registerMoveset("def-change")}
                    value="flaw"
                    disabled={[
                      getValues("hp-change"),
                      getValues("spd-change"),
                      getValues("atk-change"),
                      getValues("res-change"),
                    ].includes("flaw")}
                  />
                  <label class="flaw" for={`flaw-def`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`neutral-def`}
                    type="radio"
                    {...registerMoveset("def-change")}
                    value="neutral"
                  />
                  <label class="neutral" for={`neutral-def`}>
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`asset-def`}
                    type="radio"
                    {...registerMoveset("def-change")}
                    value="asset"
                    disabled={[
                      getValues("hp-change"),
                      getValues("spd-change"),
                      getValues("atk-change"),
                      getValues("res-change"),
                    ].includes("asset")}
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
                    {...registerMoveset("res-change")}
                    value="flaw"
                    disabled={[
                      getValues("hp-change"),
                      getValues("spd-change"),
                      getValues("atk-change"),
                      getValues("def-change"),
                    ].includes("flaw")}
                  />
                  <label class="flaw" for={`flaw-res`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`neutral-res`}
                    type="radio"
                    {...registerMoveset("res-change")}
                    value="neutral"
                  />
                  <label class="neutral" for={`neutral-res`}>
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`asset-res`}
                    type="radio"
                    {...registerMoveset("res-change")}
                    value="asset"
                    disabled={[
                      getValues("hp-change"),
                      getValues("spd-change"),
                      getValues("atk-change"),
                      getValues("def-change"),
                    ].includes("asset")}
                  />
                  <label class="asset" for={`asset-res`}>
                    Asset
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
          {skillsData.weapons.map((weaponData) => {
            return (
              <Fragment key={weaponData.name}>
                <input
                  value={weaponData.name}
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
          {skillsData.assists.map((assistData) => {
            return (
              <Fragment key={assistData.name}>
                <input
                  value={assistData.name}
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
          {skillsData.specials.map((specialsData) => {
            return (
              <Fragment key={specialsData.name}>
                <input
                  value={specialsData.name}
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
          {skillsData.A.map((passive) => {
            return (
              <Fragment key={passive.name}>
                <input
                  value={passive.name}
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
          {skillsData.B.map((passive) => {
            return (
              <Fragment key={passive.name}>
                <input
                  type="radio"
                  class="hide"
                  value={passive.name}
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
          {skillsData.C.map((passive) => {
            return (
              <Fragment key={passive.name}>
                <input
                  type="radio"
                  class="hide"
                  value={passive.name}
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
        <div class="passive-s-list">
          <h2>Sacred Seal</h2>
          {skillsData.S.map((passive) => {
            return (
              <Fragment key={passive.name}>
                <input
                  value={passive.name}
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
            onClick={() => {
              lastAbortController.current.abort();
              lastAbortController.current = new AbortController();
              fetch(`${import.meta.env.VITE_API_URL}/team`, {
                method: "POST",
                headers: {
                  "Authorization": localStorage.getItem("pid"),
                  "Content-Type": "application/json"
                },
                signal: lastAbortController.current.signal,
                body: JSON.stringify(teamPreview.filter((i) => i.name).map((rec) => {
                  const payload = {
                    name: rec.name ?? "",
                    weapon: rec.weapon ?? "",
                    assist: rec.assist ?? "",
                    special: rec.special ?? "",
                    A: rec.A ?? "",
                    B: rec.B ?? "",
                    C: rec.C ?? "",
                    S: rec.S ?? "",
                    asset: rec.asset ?? "",
                    flaw: rec.flaw ?? "",
                    merges: rec.merges ?? 0,
                  };

                  return payload;
                }))
              }).then((resp) => {
                localStorage.setItem("team", JSON.stringify(teamPreview.filter((i) => i.name).map((rec) => {
                const payload = {
                  name: rec.name ?? "",
                  weapon: rec.weapon ?? "",
                  assist: rec.assist ?? "",
                  special: rec.special ?? "",
                  A: rec.A ?? "",
                  B: rec.B ?? "",
                  C: rec.C ?? "",
                  S: rec.S ?? "",
                  asset: rec.asset ?? "",
                  flaw: rec.flaw ?? "",
                  merges: rec.merges ?? 0,
                };

                return payload;
              })));
                if (resp.ok) {
                  return {};
                }
                return resp.json()
              }).then((errors) => {
                if (!Object.keys(errors).length) {
                  alert("Your team is ready. You will be redirected to the main page.");
                  location.href = "/";
                } else {
                  let str = "";
                  for (let key in errors) {
                    str += errors[key].join(". ");
                  }
                  alert(str);
                }
              }).catch(() => {
                localStorage.setItem("team", JSON.stringify(teamPreview.filter((i) => i.name).map((rec) => {
                const payload = {
                  name: rec.name ?? "",
                  weapon: rec.weapon ?? "",
                  assist: rec.assist ?? "",
                  special: rec.special ?? "",
                  A: rec.A ?? "",
                  B: rec.B ?? "",
                  C: rec.C ?? "",
                  S: rec.S ?? "",
                  asset: rec.asset ?? "",
                  flaw: rec.flaw ?? "",
                  merges: rec.merges ?? 0,
                };

                return payload;
              })));
                alert("An unknown error happened.");
              })
            }}
            class="save"
          >
            Save Team
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSubTab("list");
            }}
            class="flaw"
          >
            Return to Unit List
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
