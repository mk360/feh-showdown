import { useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { useForm } from "react-hook-form";

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

type StatChanges = {
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

function formatName(name: string) {
  return name.replace(/[ :]/g, "").toLowerCase();
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
  return stat1 + Math.floor(Math.floor(growthRate * 1.14) * 0.39);
}

export default function Tab({
  data,
  onSave,
  index,
}: {
  data: StoredHero | null;
  onSave: (newData: StoredHero) => void;
  index: number;
}) {
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
  const [subTab, setSubTab] = useState<"list" | "detail" | "stats">("list");
  const [moveset, setMoveset] = useState<CharacterMoveset>(null);
  const {
    register: registerMoveset,
    handleSubmit: handleSubmitMoveset,
    watch,
  } = useForm<{
    [k in keyof (SkillList & StatChanges)]: string;
  }>({
    defaultValues: {
      weapons: "",
      assists: "",
      specials: "",
      A: "",
      B: "",
      C: "",
      S: "",
      "hp-change": "neutral",
      "atk-change": "neutral",
      "spd-change": "neutral",
      "def-change": "neutral",
      "res-change": "neutral",
    },
  });

  return (
    <>
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
                  <input
                    type="checkbox"
                    class="red"
                    id={`${index}-red`}
                    value="red"
                    {...register("color")}
                  />
                  <label for={`${index}-red`}>
                    <img class="game-asset" src="/red.png" />
                  </label>
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
                  <input
                    type="checkbox"
                    id="red-sword"
                    class="red"
                    value="red-sword"
                    {...register("weapons")}
                  />
                  <label for="red-sword">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Sword.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="blue-lance"
                    class="blue"
                    value="blue-lance"
                    {...register("weapons")}
                  />
                  <label for="blue-lance">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Lance.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="green-axe"
                    class="green"
                    value="green-axe"
                    {...register("weapons")}
                  />
                  <label for="green-axe">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Axe.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="colorless-staff"
                    class="colorless"
                    value="colorless-staff"
                    {...register("weapons")}
                  />
                  <label for="colorless-staff">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Staff.png"
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    id="red-tome"
                    class="red"
                    value="red-tome"
                    {...register("weapons")}
                  />
                  <label for="red-tome">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Tome.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="blue-tome"
                    class="blue"
                    value="blue-tome"
                    {...register("weapons")}
                  />
                  <label for="blue-tome">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Tome.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="green-tome"
                    class="green"
                    value="green-tome"
                    {...register("weapons")}
                  />
                  <label for="green-bow">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Tome.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="colorless-tome"
                    class="colorless"
                    value="colorless-tome"
                    {...register("weapons")}
                  />
                  <label>
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Tome.png"
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    id="red-bow"
                    class="red"
                    value="red-bow"
                    {...register("weapons")}
                  />
                  <label for="red-bow">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Bow.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    value="blue-bow"
                    id="blue-bow"
                    class="blue"
                    type="checkbox"
                    {...register("weapons")}
                  />
                  <label for="blue-bow">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Bow.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="green-bow"
                    class="green"
                    value="green-bow"
                    {...register("weapons")}
                  />
                  <label for="green-bow">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Bow.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="colorless-bow"
                    class="colorless"
                    value="colorless-bow"
                    {...register("weapons")}
                  />
                  <label for="colorless-bow">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Bow.png"
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    id="red-breath"
                    class="red"
                    value="red-breath"
                    {...register("weapons")}
                  />
                  <label for="red-breath">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Breath.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="blue-breath"
                    class="blue"
                    {...register("weapons")}
                    value="blue-breath"
                  />
                  <label for="blue-breath">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Breath.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="green-breath"
                    class="green"
                    value="green-breath"
                    {...register("weapons")}
                  />
                  <label for="green-breath">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Breath.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="colorless-breath"
                    class="colorless"
                    {...register("weapons")}
                    value="colorless-breath"
                  />
                  <label for="colorless-breath">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Breath.png"
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    id="red-dagger"
                    class="red"
                    value="red-dagger"
                    {...register("weapons")}
                  />
                  <label for="red-dagger">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Dagger.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="blue-dagger"
                    class="blue"
                    value="blue-dagger"
                    {...register("weapons")}
                  />
                  <label for="blue-dagger">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Dagger.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="green-dagger"
                    class="green"
                    value="green-dagger"
                    {...register("weapons")}
                  />
                  <label for="green-dagger">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Dagger.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="colorless-dagger"
                    class="colorless"
                    value="colorless-dagger"
                    {...register("weapons")}
                  />
                  <label for="colorless-dagger">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Dagger.png"
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    id="red-beast"
                    class="red"
                    value="red-beast"
                    {...register("weapons")}
                  />
                  <label for="red-beast">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Red_Beast.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="blue-beast"
                    class="blue"
                    value="blue-beast"
                    {...register("weapons")}
                  />
                  <label for="blue-beast">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Blue_Beast.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="green-beast"
                    class="green"
                    value="green-beast"
                    {...register("weapons")}
                  />
                  <label for="green-beast">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Green_Beast.png"
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="colorless-beast"
                    class="colorless"
                    value="colorless-beast"
                    {...register("weapons")}
                  />
                  <label for="colorless-beast">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_Colorless_Beast.png"
                    />
                  </label>
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
                    id="infantry"
                    value="infantry"
                  />
                  <label for="infantry">
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
                    id="armored"
                    value="armored"
                  />
                  <label for="armored">
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
                    id="cavalry"
                    value="cavalry"
                  />
                  <label for="cavalry">
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
                    id="flier"
                    value="flier"
                  />
                  <label for="flier">
                    <img
                      class="game-asset"
                      src="https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Move_Flier.png"
                    />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
          <fieldset id="options">
            <div>Search Mode</div>
            <div>
              <label for="union">Match any criteria</label>
              <input
                id="union"
                type="radio"
                checked
                {...register("searchMode")}
                value="union"
              />
            </div>
            <div>
              <label for="intersection">Match every criteria</label>
              <input
                id="intersection"
                type="radio"
                {...register("searchMode")}
                value="intersection"
              />
            </div>
          </fieldset>
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
      <div class={(subTab === "list" ? "hide " : "") + "detail-list"}>
        <div class="hero-portrait">
          <img src={`/portraits/${formatName(temporaryChoice ?? "")}.webp`} />
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
        </div>
        <div class="weapon-list">
          <h2>
            <img class="game-asset" src="/weapon-icon.png" /> Weapons
          </h2>
          {moveset &&
            [{ name: "No Weapon", description: "", might: 0 }]
              .concat(moveset.exclusiveSkills.weapons)
              .concat(moveset.commonSkills.weapons)
              .map((weaponData) => {
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
                      {!!weaponData.description && (
                        <p>{weaponData.description}</p>
                      )}
                    </label>
                  </Fragment>
                );
              })}
        </div>
        <div class="assist-list">
          <h2>
            <img class="game-asset" src="/assist-icon.png" />
            Assists
          </h2>
          {moveset &&
            [{ name: "No Assist", description: "" }]
              .concat(moveset.exclusiveSkills.assists)
              .concat(moveset.commonSkills.assists)
              .map((assistData) => {
                return (
                  <Fragment key={assistData.name}>
                    <input
                      value={assistData.name}
                      id={`${index}-assist-${assistData.name}`}
                      type="radio"
                      class="hide"
                      {...registerMoveset("assists")}
                    />
                    <label
                      class={`skill-label ${STATS[temporaryChoice].color}`}
                      for={`${index}-assist-${assistData.name}`}
                    >
                      <h3>
                        <img class="game-asset" src="/assist-icon.png" />
                        {assistData.name}
                      </h3>
                      {!!assistData.description && (
                        <p>{assistData.description}</p>
                      )}
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
          {moveset &&
            [{ name: "No Special", description: "" }]
              .concat(moveset.exclusiveSkills.specials)
              .concat(moveset.commonSkills.specials)
              .map((specialsData) => {
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
          {moveset &&
            [{ name: "No A", description: "" }]
              .concat(moveset.exclusiveSkills.A)
              .concat(moveset.commonSkills.A)
              .map((passive) => {
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
                        <img
                          loading="lazy"
                          class="game-asset"
                          src={`http://localhost:3479/img/${passive.name.replace(
                            "/",
                            ";"
                          )}`}
                        />
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
          {moveset &&
            [{ name: "No B", description: "" }]
              .concat(moveset.exclusiveSkills.B)
              .concat(moveset.commonSkills.B)
              .map((passive) => {
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
                        <img
                          loading="lazy"
                          class="game-asset"
                          src={`http://localhost:3479/img/${passive.name.replace(
                            "/",
                            ";"
                          )}`}
                        />
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
          {moveset &&
            [{ name: "No C", description: "" }]
              .concat(moveset.exclusiveSkills.C)
              .concat(moveset.commonSkills.C)
              .map((passive) => {
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
                        <img
                          loading="lazy"
                          class="game-asset"
                          src={`http://localhost:3479/img/${passive.name.replace(
                            "/",
                            ";"
                          )}`}
                        />
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
          {moveset &&
            [{ name: "No S", description: "" }]
              .concat(moveset.commonSkills.S)
              .map((passive) => {
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
                        <img
                          class="game-asset"
                          loading="lazy"
                          src={`http://localhost:3479/img/${passive.name.replace(
                            "/",
                            ";"
                          )}`}
                        />
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
                <td>
                  {!!temporaryChoice &&
                    convertToLevel40(
                      STATS[temporaryChoice].lv1.hp,
                      STATS[temporaryChoice].growthRates.hp
                    )}
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-flaw-hp`}
                    type="radio"
                    name="hp-change"
                    value="hp"
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
                    checked
                    name="hp-change"
                    value="hp"
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
                    name="hp-change"
                    value="hp"
                  />
                  <label class="asset" for={`${index}-asset-hp`}>
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Atk</td>
                <td>
                  {!!temporaryChoice &&
                    convertToLevel40(
                      STATS[temporaryChoice].lv1.atk,
                      STATS[temporaryChoice].growthRates.atk
                    )}
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-flaw-atk`}
                    type="radio"
                    name="atk-change"
                    value="atk"
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
                    checked
                    name="atk-change"
                    value="atk"
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
                    name="atk-change"
                    value="atk"
                  />
                  <label class="asset" for={`${index}-asset-atk`}>
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Spd</td>
                <td>
                  {!!temporaryChoice &&
                    convertToLevel40(
                      STATS[temporaryChoice].lv1.spd,
                      STATS[temporaryChoice].growthRates.spd
                    )}
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-flaw-spd`}
                    type="radio"
                    name="spd-change"
                    value="spd"
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
                    checked
                    name="spd-change"
                    value="spd"
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
                    name="spd-change"
                    value="spd"
                  />
                  <label class="asset" for={`${index}-asset-spd`}>
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Def</td>
                <td>
                  {!!temporaryChoice &&
                    convertToLevel40(
                      STATS[temporaryChoice].lv1.def,
                      STATS[temporaryChoice].growthRates.def
                    )}
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-flaw-def`}
                    type="radio"
                    name="def-change"
                    value="def"
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
                    checked
                    name="def-change"
                    value="def"
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
                    name="def-change"
                    value="def"
                  />
                  <label class="asset" for={`${index}-asset-def`}>
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Res</td>
                <td>
                  {!!temporaryChoice &&
                    convertToLevel40(
                      STATS[temporaryChoice].lv1.res,
                      STATS[temporaryChoice].growthRates.res
                    )}
                </td>
                <td>
                  <input
                    class="stat-input"
                    id={`${index}-flaw-res`}
                    type="radio"
                    name="res-change"
                    value="res"
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
                    name="res-change"
                    value="res"
                    checked
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
                    name="res-change"
                    value="res"
                  />
                  <label class="asset" for={`${index}-asset-res`}>
                    Asset
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="submit">test</div>
        <div class="moveset-summary">
          <h3>Summary</h3>
          <table>
            <tbody>
              <tr>
                <td>
                  <img class="game-asset" src="/weapon-icon.png" />
                </td>
                <td>{watch("weapons")}</td>
              </tr>
              <tr>
                <td>
                  <img class="game-asset" src="/assist-icon.png" />
                </td>
                <td>{watch("assists")}</td>
              </tr>
              <tr>
                <td>
                  <img class="game-asset" src="/special-icon.png" />
                </td>
                <td>{watch("specials")}</td>
              </tr>
              <tr>
                <td>
                  <img class="game-asset" src="/A.png" />
                </td>
                <td>{watch("A")}</td>
              </tr>
              <tr>
                <td>
                  <img class="game-asset" src="/B.png" />
                </td>
                <td>{watch("B")}</td>
              </tr>
              <tr>
                <td>
                  <img class="game-asset" src="/C.png" />
                </td>
                <td>{watch("C")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="navigation">
          <button
            onClick={() => {
              setSubTab("list");
            }}
          >
            Return to Unit List
          </button>
        </div>
      </div>
    </>
  );
}
