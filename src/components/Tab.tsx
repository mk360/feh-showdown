import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { useForm } from "react-hook-form";
import SKILL_STAT_CHANGES from "../../public/buffs";
import TeamContext from "../team-context";
import formatName from "../utils/formatName";
import UnitPreview from "./unit-preview";
import WeaponCheckbox from "./weapon-checkbox";
import Summary from "./summary";

type FEH_Stat = "atk" | "def" | "spd" | "res" | "hp";

type FEHStats = {
  [k in FEH_Stat]: number;
};

interface HeroFilters {
  characterName: string;
  color: string[];
  weapons: string[];
  movement: string[];
  searchMode: "union" | "intersection";
}

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
  [k in
    | "hp-change"
    | "atk-change"
    | "spd-change"
    | "def-change"
    | "res-change"]: "asset" | "flaw" | "neutral";
};

interface CharacterMoveset {
  exclusiveSkills: Omit<SkillList, "S">;
  commonSkills: SkillList;
}

function capitalize(string: string) {
  return string[0].toUpperCase() + string.substring(1, string.length);
}

function getResultsFromFilters(filters: HeroFilters) {
  let collectedResults: string[] = [];

  if (filters.searchMode === "union") {
    if (filters.color) {
      for (let color of filters.color) {
        const fullRoster = Object.values<string>(WEAPON_TREE[color]).flat();
        collectedResults = collectedResults.concat(fullRoster);
      }
    }

    if (filters.weapons) {
      for (let weapon of filters.weapons) {
        const [color, weaponType] = weapon.split("-");
        const units = WEAPON_TREE[color][weaponType] ?? [];
        collectedResults = collectedResults.concat(units);
      }
    }

    if (filters.movement) {
      for (let movement of filters.movement) {
        const units = MOVEMENT_TREE[movement] ?? [];
        collectedResults = collectedResults.concat(units);
      }
    }
  } else {
    if (filters.characterName) {
      const formattedSearch = formatName(filters.characterName);
      collectedResults = collectedResults.filter((result) => {
        return result.startsWith(formattedSearch);
      });
    }

    if (filters.color.length) {
      collectedResults = collectedResults.filter((result) => {
        return filters.color.includes(STATS[result].color);
      });
    }

    if (filters.weapons.length) {
      collectedResults = collectedResults.filter((result) => {
        return filters.color.includes(STATS[result].weaponType);
      });
    }

    if (filters.movement.length) {
      collectedResults = collectedResults.filter((result) => {
        return filters.color.includes(STATS[result].movementType);
      });
    }
  }

  return Array.from(new Set(collectedResults));
}

function convertToLevel40(stat1: number, growthRate: number) {
  const appliedGrowthRate = Math.floor(growthRate * 1.14 + 1e-10);
  const growthValue = Math.floor((39 * appliedGrowthRate) / 100);
  return stat1 + growthValue;
}

export default function Tab({ index }: { index: number }) {
  const { register, handleSubmit } = useForm<HeroFilters>({
    defaultValues: {
      characterName: "",
      color: [],
      weapons: [],
      movement: [],
      searchMode: "union",
    },
    mode: "onTouched",
  });
  const [temporaryChoice, setTemporaryChoice] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [subTab, setSubTab] = useState<"list" | "detail">("list");
  const [moveset, setMoveset] = useState<CharacterMoveset>(null);
  const { teamPreview, setTeamPreview, tab } = useContext(TeamContext);
  const {
    register: registerMoveset,
    handleSubmit: handleSubmitMoveset,
    getValues,
    reset,
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
    },
  });

  const skillsData = useMemo(() => {
    return {
      weapons: !moveset
        ? []
        : [{ name: "No Weapon", description: "", might: 0 }]
            .concat(moveset.exclusiveSkills.weapons || [])
            .concat(moveset.commonSkills.weapons || []),
      assists: !moveset
        ? []
        : [{ name: "No Assist", description: "" }]
            .concat(moveset.exclusiveSkills.assists)
            .concat(moveset.commonSkills.assists),
      specials: !moveset
        ? []
        : [{ name: "No Special", description: "" }]
            .concat(moveset.exclusiveSkills.specials)
            .concat(moveset.commonSkills.specials),
      A: !moveset
        ? []
        : [{ name: "No A", description: "" }]
            .concat(moveset.exclusiveSkills.A)
            .concat(moveset.commonSkills.A),
      B: !moveset
        ? []
        : [{ name: "No B", description: "" }]
            .concat(moveset.exclusiveSkills.B)
            .concat(moveset.commonSkills.B),
      C: !moveset
        ? []
        : [{ name: "No C", description: "" }]
            .concat(moveset.exclusiveSkills.C)
            .concat(moveset.commonSkills.C),
      S: !moveset
        ? []
        : [{ name: "No S", description: "" }].concat(moveset.commonSkills.S),
    };
  }, [moveset]);

  useEffect(() => {
    if (temporaryChoice) {
      reset();
      scrollTo({
        top: 0,
        behavior: "instant",
      });
      handleSubmitMoveset((data) => {
        const copy: StoredHero[] = [];
        for (let member of teamPreview) {
          copy.push(member);
        }
        copy[index] = {
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
      })();
    }
  }, [temporaryChoice]);

  const extraStats = useMemo(() => {
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
  }, [
    getValues("weapons"),
    getValues("assists"),
    getValues("specials"),
    getValues("A"),
    getValues("B"),
    getValues("C"),
    getValues("S"),
  ]);

  const getAlteredStats = function () {
    const statChanges = ["hp", "atk", "spd", "def", "res"] as const;

    const asset = statChanges.find(
      (stat: FEH_Stat) => getValues(`${stat}-change`) === "asset"
    );
    const flaw = statChanges.find(
      (stat: FEH_Stat) => getValues(`${stat}-change`) === "flaw"
    );

    return {
      asset,
      flaw,
    };
  };

  const getLevel40Stat = useCallback(
    (options: {
      lv1Stat: number;
      character: string;
      stat: FEH_Stat;
      extraStats: { [k in FEH_Stat]?: number };
    }) => {
      const trackedStatChange = getValues(`${options.stat}-change`);
      const baseGrowthRate = STATS[options.character].growthRates[options.stat];
      const baseLevel1 = STATS[options.character].lv1[options.stat];
      const finalGrowthRate =
        trackedStatChange === "asset"
          ? baseGrowthRate + 5
          : trackedStatChange === "flaw"
          ? baseGrowthRate - 5
          : baseGrowthRate;
      const finalLevel1 =
        trackedStatChange === "asset"
          ? baseLevel1 + 1
          : trackedStatChange === "flaw"
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
      .sort(([b, stat1], [a, stat2]) => stat2 - stat1)
      .map(([key, value]) => ({
        stat: key,
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

    const obj: { [k in FEH_Stat]: number } = {
      hp: sortedStats.find((s) => s.stat === "hp").value,
      atk: sortedStats.find((s) => s.stat === "atk").value,
      spd: sortedStats.find((s) => s.stat === "spd").value,
      def: sortedStats.find((s) => s.stat === "def").value,
      res: sortedStats.find((s) => s.stat === "res").value,
    };

    return obj;
  };

  const stats = !temporaryChoice
    ? {
        atk: 0,
        hp: 0,
        spd: 0,
        def: 0,
        res: 0,
      }
    : withMerges(
        {
          hp: getLevel40Stat({
            lv1Stat: STATS[temporaryChoice].lv1.hp,
            character: temporaryChoice,
            stat: "hp",
            extraStats,
          }),
          atk: getLevel40Stat({
            lv1Stat: STATS[temporaryChoice].lv1.atk,
            character: temporaryChoice,
            stat: "atk",
            extraStats,
          }),
          spd: getLevel40Stat({
            lv1Stat: STATS[temporaryChoice].lv1.spd,
            character: temporaryChoice,
            stat: "spd",
            extraStats,
          }),
          def: getLevel40Stat({
            lv1Stat: STATS[temporaryChoice].lv1.def,
            character: temporaryChoice,
            stat: "def",
            extraStats,
          }),
          res: getLevel40Stat({
            lv1Stat: STATS[temporaryChoice].lv1.res,
            character: temporaryChoice,
            stat: "res",
            extraStats,
          }),
        },
        +getValues("merges")
      );

  return (
    <section class={tab !== index ? "hide" : ""}>
      <div class={subTab === "detail" ? "hide" : ""}>
        <form
          onSubmit={handleSubmit((data) => {
            setResults(getResultsFromFilters(data));
          })}
        >
          <table>
            <thead>
              <tr>
                <td
                  colSpan={4}
                  style="text-align: center; color: white; padding: 10px"
                >
                  Character Name
                </td>
              </tr>
              <tr>
                <td colSpan={4}>
                  <input {...register("characterName")} />
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={4}
                  style="text-align: center; color: white; padding: 10px"
                >
                  Weapon Type
                </td>
              </tr>
              <tr>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="red"
                    weapon="beast"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Beast.png"
                  />
                </td>
                <td>
                  <input
                    value="blue"
                    class="blue"
                    id={`${index}-blue`}
                    type="checkbox"
                    {...register("color")}
                  />
                  <label for={`${index}-blue`}>
                    <img class="game-asset" src="/blue.png" />
                  </label>
                </td>
                <td>
                  <input
                    value="green"
                    class="green"
                    id={`${index}-green`}
                    type="checkbox"
                    {...register("color")}
                  />
                  <label for={`${index}-green`}>
                    <img class="game-asset" src="/green.png" />
                  </label>
                </td>
                <td>
                  <input
                    value="colorless"
                    class="colorless"
                    id={`${index}-colorless`}
                    type="checkbox"
                    {...register("color")}
                  />
                  <label for={`${index}-colorless`}>
                    <img class="game-asset" src="/colorless.png" />
                  </label>
                </td>
              </tr>
              <tr>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="red"
                    weapon="sword"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Sword.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="blue"
                    weapon="lance"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Lance.png"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    id={`${index}-green-axe`}
                    class="green"
                    value="green-axe"
                    {...register("weapons")}
                  />
                  <label for={`${index}-green-axe`}>
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Axe.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id={`${index}-colorless-staff`}
                    class="colorless"
                    value="colorless-staff"
                    {...register("weapons")}
                  />
                  <label for={`${index}-colorless-staff`}>
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Staff.png"
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="red"
                    weapon="tome"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Tome.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="blue"
                    weapon="tome"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Tome.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="green"
                    weapon="tome"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Tome.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="colorless"
                    weapon="tome"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Tome.png"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="red"
                    weapon="bow"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Bow.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="blue"
                    weapon="bow"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Bow.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="green"
                    weapon="bow"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Bow.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="colorless"
                    weapon="bow"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Bow.png"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="red"
                    weapon="breath"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Breath.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="blue"
                    weapon="breath"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Breath.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="green"
                    weapon="breath"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Breath.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="colorless"
                    weapon="breath"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Breath.png"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="red"
                    weapon="dagger"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Dagger.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="blue"
                    weapon="dagger"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Dagger.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="green"
                    weapon="dagger"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Dagger.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="colorless"
                    weapon="dagger"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Dagger.png"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="red"
                    weapon="beast"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Beast.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="blue"
                    weapon="beast"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Beast.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="green"
                    weapon="beast"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Beast.png"
                  />
                </td>
                <td>
                  <WeaponCheckbox
                    register={register}
                    index={index}
                    color="colorless"
                    weapon="beast"
                    url="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Beast.png"
                  />
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  style="text-align: center; color: white; padding: 10px"
                >
                  Movement Type
                </td>
              </tr>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    class="movement"
                    {...register("movement")}
                    id={`${index}-infantry`}
                    value="infantry"
                  />
                  <label for={`${index}-infantry`}>
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Move_Infantry.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    class="movement"
                    {...register("movement")}
                    id={`${index}-armored`}
                    value="armored"
                  />
                  <label for={`${index}-armored`}>
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Move_Armored.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    class="movement"
                    {...register("movement")}
                    id={`${index}-cavalry`}
                    value="cavalry"
                  />
                  <label for={`${index}-cavalry`}>
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Move_Cavalry.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    class="movement"
                    {...register("movement")}
                    id={`${index}-flier`}
                    value="flier"
                  />
                  <label for={`${index}-flier`}>
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Move_Flier.png"
                    />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
          {/* <fieldset id={`${index}-options`}>
            <div>Search Mode</div>
            <div>
              <label for={`${index}-union`}>Match any criteria</label>
              <input
                id={`${index}-union`}
                type="radio"
                {...register("searchMode")}
                value="union"
              />
            </div>
            <div>
              <label for={`${index}-intersection`}>Match every criteria</label>
              <input
                id={`${index}-intersection`}
                type="radio"
                {...register("searchMode")}
                value="intersection"
              />
            </div>
          </fieldset> */}
          <input type="submit" />
        </form>
        <div class="results">
          <table>
            <thead>
              <tr>
                <th rowSpan={2}>Name</th>
                <th colSpan={6}>5 Stars Level 40</th>
              </tr>
              <tr>
                <th class="HP">HP</th>
                <th class="Atk">Atk</th>
                <th class="Spd">Spd</th>
                <th class="Def">Def</th>
                <th class="Res">Res</th>
                <th class="BST">BST</th>
              </tr>
            </thead>
            <tbody
              onClick={(e) => {
                let target = e.target as HTMLElement;
                while (target.nodeName !== "TR") {
                  target = target.parentElement;
                }
                const urlParams = new URLSearchParams();
                urlParams.append("name", encodeURIComponent(target.id));
                fetch(`http://localhost:3800/moveset?${urlParams.toString()}`)
                  .then((resp) => {
                    return resp.json();
                  })
                  .then((moveset) => {
                    setTemporaryChoice(target.id);
                    setSubTab("detail");
                    setMoveset(moveset);
                  });
              }}
            >
              {results.map((result) => {
                const formattedName = formatName(result);
                const stats = STATS[result] ?? "";

                return (
                  <tr id={result} key={result}>
                    <td class="portrait-cell">
                      <div class="thumbnail">
                        <img
                          class="portrait loading"
                          src={`/thumbnails/${formattedName}.webp`}
                          alt={result}
                          onLoad={function (e) {
                            (e.target as HTMLImageElement).classList.remove(
                              "loading"
                            );
                          }}
                        />
                        <img
                          class="movement-icon"
                          src={`https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Move_${capitalize(
                            stats.movementType
                          )}.png`}
                        />
                        <img
                          class="weapon-icon"
                          src={`https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_${[
                            stats.color,
                            stats.weaponType,
                          ]
                            .map(capitalize)
                            .join("_")}.png`}
                        />
                      </div>
                      {result}
                      <div />
                    </td>
                    <td class="HP">
                      {convertToLevel40(stats.lv1.hp, stats.growthRates.hp)}
                    </td>
                    <td class="Atk">
                      {convertToLevel40(stats.lv1.atk, stats.growthRates.atk)}
                    </td>
                    <td class="Spd">
                      {convertToLevel40(stats.lv1.spd, stats.growthRates.spd)}
                    </td>
                    <td class="Def">
                      {convertToLevel40(stats.lv1.def, stats.growthRates.def)}
                    </td>
                    <td class="Res">
                      {convertToLevel40(stats.lv1.res, stats.growthRates.res)}
                    </td>
                    <td class="BST">
                      {convertToLevel40(stats.lv1.hp, stats.growthRates.hp) +
                        convertToLevel40(stats.lv1.atk, stats.growthRates.atk) +
                        convertToLevel40(stats.lv1.spd, stats.growthRates.spd) +
                        convertToLevel40(stats.lv1.def, stats.growthRates.def) +
                        convertToLevel40(stats.lv1.res, stats.growthRates.res)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div
        onChange={handleSubmitMoveset((data) => {
          const copy: StoredHero[] = [];
          for (let member of teamPreview) {
            copy.push(member);
          }
          copy[index] = {
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
        class={(subTab === "list" ? "hide " : "") + "detail-list"}
      >
        <div class="hero-portrait">
          <div class="hero-intro">
            <span>{temporaryChoice}</span>
            <div>
              {temporaryChoice && (
                <>
                  <img
                    src={`https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_${[
                      STATS[temporaryChoice].color,
                      STATS[temporaryChoice].weaponType,
                    ]
                      .map(capitalize)
                      .join("_")}.png`}
                  />
                  <img
                    src={`https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Move_${capitalize(
                      STATS[temporaryChoice ?? ""].movementType
                    )}.png`}
                  />
                </>
              )}
            </div>
          </div>
          <img src={`/portraits/${formatName(temporaryChoice ?? "")}.webp`} />
          <div />
        </div>
        <div class="weapon-list">
          <h2>
            <img class="game-asset" src="/weapon-icon.png" /> Weapons
          </h2>
          {skillsData.weapons.map((weaponData) => {
            return (
              <Fragment key={weaponData.name}>
                <input
                  value={weaponData.name}
                  id={`${index}-weapon-${weaponData.name}`}
                  type="radio"
                  class="hide"
                  {...registerMoveset("weapons")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`${index}-weapon-${weaponData.name}`}
                >
                  <div>
                    <h3>
                      <img class="game-asset" src="/weapon-icon.png" />
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
        <div class="assists-list">
          <h2>
            <img class="game-asset" src="/assists-icon.png" />
            Assists
          </h2>
          {skillsData.assists.map((assistData) => {
            return (
              <Fragment key={assistData.name}>
                <input
                  value={assistData.name}
                  id={`${index}-assists-${assistData.name}`}
                  type="radio"
                  class="hide"
                  {...registerMoveset("assists")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`${index}-assists-${assistData.name}`}
                >
                  <h3>
                    <img class="game-asset" src="/assist-icon.png" />
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
            <img class="game-asset" src="/special-icon.png" />
            Specials
          </h2>
          {skillsData.specials.map((specialsData) => {
            return (
              <Fragment key={specialsData.name}>
                <input
                  value={specialsData.name}
                  id={`${index}-special-${specialsData.name}`}
                  type="radio"
                  class="hide"
                  {...registerMoveset("specials")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`${index}-special-${specialsData.name}`}
                >
                  <h3>
                    <img class="game-asset" src="/special-icon.png" />
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
            <img class="game-asset" src="/A.png" />
            Skill
          </h2>
          {skillsData.A.map((passive) => {
            return (
              <Fragment key={passive.name}>
                <input
                  value={passive.name}
                  id={`${index}-A-${passive.name}`}
                  type="radio"
                  class="hide"
                  {...registerMoveset("A")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`${index}-A-${passive.name}`}
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
            <img class="game-asset" src="/B.png" />
            Skill
          </h2>
          {skillsData.B.map((passive) => {
            return (
              <Fragment key={passive.name}>
                <input
                  type="radio"
                  class="hide"
                  value={passive.name}
                  id={`${index}-B-${passive.name}`}
                  {...registerMoveset("B")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`${index}-B-${passive.name}`}
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
            <img class="game-asset" src="/C.png" />
            Skill C
          </h2>
          {skillsData.C.map((passive) => {
            return (
              <Fragment key={passive.name}>
                <input
                  type="radio"
                  class="hide"
                  value={passive.name}
                  id={`${index}-C-${passive.name}`}
                  {...registerMoveset("C")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`${index}-C-${passive.name}`}
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
                  id={`${index}-S-${passive.name}`}
                  type="radio"
                  class="hide"
                  {...registerMoveset("S")}
                />
                <label
                  class={`skill-label ${STATS[temporaryChoice].color}`}
                  for={`${index}-S-${passive.name}`}
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
                    id={`${index}-flaw-hp`}
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
                  <label class="flaw" for={`${index}-flaw-hp`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-neutral-hp`}
                    type="radio"
                    {...registerMoveset("hp-change")}
                    value="neutral"
                  />
                  <label class="neutral" for={`${index}-neutral-hp`}>
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-asset-hp`}
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
                  <label class="asset" for={`${index}-asset-hp`}>
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
                    id={`${index}-flaw-atk`}
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
                  <label class="flaw" for={`${index}-flaw-atk`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-neutral-atk`}
                    type="radio"
                    {...registerMoveset("atk-change")}
                    value="neutral"
                  />
                  <label class="neutral" for={`${index}-neutral-atk`}>
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-asset-atk`}
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
                  <label class="asset" for={`${index}-asset-atk`}>
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
                    id={`${index}-flaw-spd`}
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
                  <label class="flaw" for={`${index}-flaw-spd`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-neutral-spd`}
                    type="radio"
                    {...registerMoveset("spd-change")}
                    value="neutral"
                  />
                  <label class="neutral" for={`${index}-neutral-spd`}>
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-asset-spd`}
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
                  <label class="asset" for={`${index}-asset-spd`}>
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
                    id={`${index}-flaw-def`}
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
                  <label class="flaw" for={`${index}-flaw-def`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-neutral-def`}
                    type="radio"
                    {...registerMoveset("def-change")}
                    value="neutral"
                  />
                  <label class="neutral" for={`${index}-neutral-def`}>
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-asset-def`}
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
                  <label class="asset" for={`${index}-asset-def`}>
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
                    id={`${index}-flaw-res`}
                    type="radio"
                    {...registerMoveset("res-change")}
                    value="flaw"
                    disabled={["hp", "spd", "atk", "def"].includes(
                      getAlteredStats().flaw
                    )}
                  />
                  <label class="flaw" for={`${index}-flaw-res`}>
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-neutral-res`}
                    type="radio"
                    {...registerMoveset("res-change")}
                    value="neutral"
                  />
                  <label class="neutral" for={`${index}-neutral-res`}>
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-asset-res`}
                    type="radio"
                    {...registerMoveset("res-change")}
                    value="asset"
                    disabled={["hp", "spd", "atk", "def"].includes(
                      getAlteredStats().asset
                    )}
                  />
                  <label class="asset" for={`${index}-asset-res`}>
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
        <div class="preview">
          {teamPreview.map((preview, index) => {
            return <UnitPreview data={preview} key={index} />;
          })}
        </div>
        <div class="submit">
          <button class="asset" onClick={() => {}}>
            Save Teammate
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
          <Summary data={teamPreview[index]} />
        </div>
      </div>
    </section>
  );
}
