import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { useForm } from "react-hook-form";
import SKILL_STAT_CHANGES from "../buffs";
import TeamContext from "../team-context";
import fetchMovesets from "../utils/fetch-moveset";
import { formatName } from "../utils/strings";
import Summary from "./summary";
import TeamPreview from "./team-preview";
import UnitList from "./unit-list";
import STATS from "../stats";

interface SkillWithDescription {
  name: string;
  description: string;
}

interface SkillList {
  weapons: (SkillWithDescription & { might: number })[];
  assists: SkillWithDescription[];
  specials: SkillWithDescription[];
  A: SkillWithDescription[];
  B: SkillWithDescription[];
  C: SkillWithDescription[];
  S: SkillWithDescription[];
}

type StatChangeFields = {
  [k in `${FEH_Stat}-change`]: "asset" | "flaw" | "neutral";
};

interface CharacterMoveset {
  exclusiveSkills: Omit<SkillList, "S">;
  commonSkills: SkillList;
}

const statLabels = ["hp", "atk", "spd", "def", "res"];

function convertToLevel40(stat1: number, growthRate: number) {
  const appliedGrowthRate = Math.floor(growthRate * 1.14 + 1e-10);
  const growthValue = Math.floor((39 * appliedGrowthRate) / 100);
  return stat1 + growthValue;
}

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
    reset,
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
    const unitName = teamPreview[tab].name;
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
      specials: [{ name: "No Special", description: "" }]
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
  }, [moveset, tab]);

  useEffect(() => {
    if (teamPreview[tab].name) {
      fetchMovesets(teamPreview[tab].name).then((moveset) => {
        const tabData = teamPreview[tab];
        setTemporaryChoice(teamPreview[tab].name);
        setValue("merges", tabData.merges.toString());
        setValue("hp-change", tabData.stats.asset === "hp" ? "asset" : tabData.stats.flaw === "hp" ? "flaw" : "");
        setValue("atk-change", tabData.stats.asset === "atk" ? "asset" : tabData.stats.flaw === "atk" ? "flaw" : "");
        setValue("spd-change", tabData.stats.asset === "spd" ? "asset" : tabData.stats.flaw === "spd" ? "flaw" : "");
        setValue("def-change", tabData.stats.asset === "def" ? "asset" : tabData.stats.flaw === "def" ? "flaw" : "");
        setValue("res-change", tabData.stats.asset === "res" ? "asset" : tabData.stats.flaw === "res" ? "flaw" : "");
        setValue("weapons", tabData.weapon);
        setValue("assists", tabData.assist);
        setValue("specials", tabData.special);
        setValue("A", tabData.passive_a);
        setValue("B", tabData.passive_b);
        setValue("C", tabData.passive_c);
        setValue("S", tabData.passive_s);
        setMoveset(moveset);
      });
    }
  }, [teamPreview[tab].name]);

  useEffect(() => {
    if (teamPreview[tab].name) {
      setSubTab("detail");
    } else {
      setSubTab("list");
    }
  }, [teamPreview[tab].name]);

  const getExtraStats = () => {
    const stats: { [k in FEH_Stat]?: number } = {
      hp: 0,
      atk:
        skillsData.weapons.find(({ name }) => name === getValues("weapons"))
          ?.might ?? 0,
      spd: 0,
      def: 0,
      res: 0,
    };

    for (let key of [
      "weapons",
      "assists",
      "specials",
      "A",
      "B",
      "C",
      "S",
    ] as const) {
      const fieldValue = getValues(key);
      const skillStatChange = SKILL_STAT_CHANGES[fieldValue];
      for (let changedStat in skillStatChange) {
        stats[changedStat] += skillStatChange[changedStat];
      }
    }

    return stats;
  };

  const getAlteredStats = function () {
    const statChanges = ["hp", "atk", "spd", "def", "res"] as const;

    const asset = statChanges.find(
      (stat: FEH_Stat) => getValues(`${stat}-change`) === "asset"
    );
    const flaw = statChanges.find(
      (stat: FEH_Stat) => getValues(`${stat}-change`) === "flaw"
    );

    if (asset && flaw) {
      return {
        asset,
        flaw,
      };
    }

    return {
      asset: "" as const,
      flaw: "" as const
    };
  };

  const getLevel40Stat = useCallback(
    (options: {
      lv1Stat: number;
      character: string;
      stat: FEH_Stat;
      extraStats: { [k in FEH_Stat]?: number };
    }) => {
      const alteredStats = getAlteredStats();
      const baseGrowthRate = STATS[options.character].growthRates[options.stat];
      const baseLevel1 = STATS[options.character].lv1[options.stat];
      const finalGrowthRate =
        alteredStats.asset === options.stat
          ? baseGrowthRate + 5
          : alteredStats.asset === options.stat
          ? baseGrowthRate - 5
          : baseGrowthRate;
      const finalLevel1 =
        alteredStats.asset === options.stat
          ? baseLevel1 + 1
          : alteredStats.flaw === options.stat
          ? baseLevel1 - 1
          : baseLevel1;
      const level40Stat = convertToLevel40(finalLevel1, finalGrowthRate);
      return level40Stat + options.extraStats[options.stat];
    },
    []
  );

  const withMerges = function (stats: FEHStats, merges: number) {
    const alteredStats = getAlteredStats();
    const sortedStats = Object.entries(stats)
      .sort(([b, stat1], [a, stat2]) => {
        const statDifference = stat2 - stat1;
        if (!statDifference)
          return statLabels.indexOf(b) - statLabels.indexOf(a);
        return statDifference;
      })
      .map(([stat, value]) => ({
        stat,
        value,
      }));
    const firstStatChange =
      alteredStats.asset && alteredStats.flaw ? [0, 1] : [0, 1, 2];
    const statChanges = [
      firstStatChange,
      [2, 3],
      [4, 0],
      [1, 2],
      [3, 4],
      [0, 1],
      [2, 3],
      [4, 0],
      [1, 2],
    ];

    for (let i = 0; i < merges; i++) {
      let mod5 = i % 5;
      let increase = statChanges[mod5];
      for (let index of increase) {
        sortedStats[index].value++;
      }
    }

    const splitStats = Object.groupBy(sortedStats, (s) => s.stat);

    const obj: { [k in FEH_Stat]: number } = {
      hp: splitStats["hp"][0]?.value,
      atk: splitStats["atk"][0]?.value,
      spd: splitStats["spd"][0]?.value,
      def: splitStats["def"][0]?.value,
      res: splitStats["res"][0]?.value,
    };

    return obj;
  };

  const baseStats = !temporaryChoice
    ? {
        atk: 0,
        hp: 0,
        spd: 0,
        def: 0,
        res: 0,
      }
    : {
        hp: getLevel40Stat({
          lv1Stat: STATS[temporaryChoice].lv1.hp,
          character: temporaryChoice,
          stat: "hp",
          extraStats: getExtraStats(),
        }),
        atk: getLevel40Stat({
          lv1Stat: STATS[temporaryChoice].lv1.atk,
          character: temporaryChoice,
          stat: "atk",
          extraStats: getExtraStats(),
        }),
        spd: getLevel40Stat({
          lv1Stat: STATS[temporaryChoice].lv1.spd,
          character: temporaryChoice,
          stat: "spd",
          extraStats: getExtraStats(),
        }),
        def: getLevel40Stat({
          lv1Stat: STATS[temporaryChoice].lv1.def,
          character: temporaryChoice,
          stat: "def",
          extraStats: getExtraStats(),
        }),
        res: getLevel40Stat({
          lv1Stat: STATS[temporaryChoice].lv1.res,
          character: temporaryChoice,
          stat: "res",
          extraStats: getExtraStats(),
        }),
      };

  const stats = !temporaryChoice
    ? {
        atk: 0,
        hp: 0,
        spd: 0,
        def: 0,
        res: 0,
      }
    : withMerges(baseStats, +getValues("merges"));

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
              setSubTab("detail");
              setMoveset(moveset);
            });
          }}
          index={tab}
        />
      </div>
      <div
        onChange={handleSubmitMoveset((data) => {
          const baseStats = !temporaryChoice
            ? {
                atk: 0,
                hp: 0,
                spd: 0,
                def: 0,
                res: 0,
              }
            : {
                hp: getLevel40Stat({
                  lv1Stat: STATS[temporaryChoice].lv1.hp,
                  character: temporaryChoice,
                  stat: "hp",
                  extraStats: getExtraStats(),
                }),
                atk: getLevel40Stat({
                  lv1Stat: STATS[temporaryChoice].lv1.atk,
                  character: temporaryChoice,
                  stat: "atk",
                  extraStats: getExtraStats(),
                }),
                spd: getLevel40Stat({
                  lv1Stat: STATS[temporaryChoice].lv1.spd,
                  character: temporaryChoice,
                  stat: "spd",
                  extraStats: getExtraStats(),
                }),
                def: getLevel40Stat({
                  lv1Stat: STATS[temporaryChoice].lv1.def,
                  character: temporaryChoice,
                  stat: "def",
                  extraStats: getExtraStats(),
                }),
                res: getLevel40Stat({
                  lv1Stat: STATS[temporaryChoice].lv1.res,
                  character: temporaryChoice,
                  stat: "res",
                  extraStats: getExtraStats(),
                }),
              };

          const stats = !temporaryChoice
            ? {
                atk: 0,
                hp: 0,
                spd: 0,
                def: 0,
                res: 0,
              }
            : withMerges(baseStats, +getValues("merges"));
          const copy: StoredHero[] = [];
          for (let member of teamPreview) {
            copy.push(member);
          }
          copy[tab] = {
            name: temporaryChoice,
            weapon: data.weapons,
            assist: data.assists,
            special: data.specials,
            merges: +data.merges,
            passive_a: data.A,
            passive_b: data.B,
            passive_c: data.C,
            passive_s: data.S,
            stats: {
              ...stats,
              ...getAlteredStats(),
            },
          };
          setTeamPreview(copy);
        })}
        class={
          (subTab === "list" ? "hide " : "") + "detail-list"
        }
      >
        <div class="hero-portrait">
          <h2>{temporaryChoice}</h2>
          <img src={`/teambuilder/portraits/${formatName(temporaryChoice ?? "")}.webp`} />
          <div />
        </div>
        <div class="stats">
          <h2>Stats</h2>
          <table>
            <tbody>
              <tr>
                <td>HP</td>
                <td>{!!temporaryChoice && stats.hp}</td>
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
                <td>{!!temporaryChoice && stats.atk}</td>
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
                  <label class="neutral" for={`neutral-atk`}>
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
                  <label class="asset" for={`asset-atk`}>
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Spd</td>
                <td>{!!temporaryChoice && stats.spd}</td>
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
                <td>{!!temporaryChoice && stats.def}</td>
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
                <td>{!!temporaryChoice && stats.res}</td>
                <td>
                  <input
                    class="stat-input"
                    id={`flaw-res`}
                    type="radio"
                    {...registerMoveset("res-change")}
                    value="flaw"
                    disabled={["hp", "spd", "atk", "def"].includes(
                      getAlteredStats().flaw
                    )}
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
                    disabled={["hp", "spd", "atk", "def"].includes(
                      getAlteredStats().asset
                    )}
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
                  <h3>
                    <img class="game-asset" src="/teambuilder/special-icon.png" />
                    {specialsData.name}
                  </h3>
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
                        src={`http://localhost:3479/img/${passive.name.replace(
                          "/",
                          ";"
                        )}`}
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
                        src={`http://localhost:3479/img/${passive.name.replace(
                          "/",
                          ";"
                        )}`}
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
                        src={`http://localhost:3479/img/${passive.name.replace(
                          "/",
                          ";"
                        )}`}
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
                        src={`http://localhost:3479/img/${passive.name.replace(
                          "/",
                          ";"
                        )}`}
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
              fetch(`http://localhost:3800/team`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                signal: lastAbortController.current.signal,
                body: JSON.stringify(teamPreview.filter((i) => i.name))
              }).then((resp) => {
                console.log(resp.ok);
                return resp.json()
              }).then(console.log)
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
