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
    getValues,
  } = useForm<{
    [k in keyof (SkillList & { flaw: string; asset: string })]: string;
  }>({
    defaultValues: {
      weapons: "",
      assists: "",
      specials: "",
      A: "",
      B: "",
      C: "",
      S: "",
      asset: "",
      flaw: "",
    },
  });

  const fileReg = /[<>:"/\\|?*]/;

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
                    <b>Red</b>
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
                    <b>Blue</b>
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
                    <b>Green</b>
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
                    <b>Colorless</b>
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
                    <b>Red Sword</b>
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
                    <b>Blue Lance</b>
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
                    <b>Green Axe</b>
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
                    <b>Colorless Staff</b>
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
                    <b>Red Tome</b>
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
                    <b>Blue Tome</b>
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
                  <label for="green-tome">
                    <b>Green Tome</b>
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
                    <b>Colorless Tome</b>
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
                    <b>Red Bow</b>
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
                    <b>Blue Bow</b>
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
                    <b>Green Bow</b>
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
                    <b>Colorless Bow</b>
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
                    <b>Red Breath</b>
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
                    <b>Blue Breath</b>
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
                    <b>Green Breath</b>
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
                    <b>Colorless Breath</b>
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
                    <b>Red Dagger</b>
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
                    <b>Blue Dagger</b>
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
                    <b>Green Dagger</b>
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
                    <b>Colorless Dagger</b>
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
                    <b>Red Beast</b>
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
                    <b>Blue Beast</b>
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
                    <b>Green Beast</b>
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
                    <b>Colorless Beast</b>
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
                    <b>Infantry</b>
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
                    <b>Armored</b>
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
                    <b>Cavalry</b>
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
                    <b>Flier</b>
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
                <th colSpan={5}>5 Stars Level 40</th>
              </tr>
              <tr>
                <th>HP</th>
                <th>Atk</th>
                <th>Spd</th>
                <th>Def</th>
                <th>Res</th>
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
                    </td>
                    <td>
                      {convertToLevel40(stats.lv1.hp, stats.growthRates.hp)}
                    </td>
                    <td>
                      {convertToLevel40(stats.lv1.atk, stats.growthRates.atk)}
                    </td>
                    <td>
                      {convertToLevel40(stats.lv1.spd, stats.growthRates.spd)}
                    </td>
                    <td>
                      {convertToLevel40(stats.lv1.def, stats.growthRates.def)}
                    </td>
                    <td>
                      {convertToLevel40(stats.lv1.res, stats.growthRates.res)}
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
                      id={weaponData.name}
                      type="radio"
                      class="hide"
                      value={weaponData.name}
                      {...registerMoveset("weapons")}
                    />
                    <label
                      class={`skill-label ${STATS[temporaryChoice].color}`}
                      for={weaponData.name}
                    >
                      <div>
                        <h3>
                          <img class="game-asset" src="/weapon-icon.png" />
                          {weaponData.name}
                        </h3>
                        {!!weaponData.might && <h4>{weaponData.might}</h4>}
                      </div>
                      <p>{weaponData.description}</p>
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
                      id={assistData.name}
                      type="radio"
                      class="hide"
                      value={assistData.name}
                      {...registerMoveset("assists")}
                    />
                    <label
                      class={`skill-label ${STATS[temporaryChoice].color}`}
                      for={assistData.name}
                    >
                      <h3>
                        <img class="game-asset" src="/assist-icon.png" />
                        {assistData.name}
                      </h3>
                      <p>{assistData.description}</p>
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
                      id={specialsData.name}
                      type="radio"
                      class="hide"
                      value={specialsData.name}
                      {...registerMoveset("specials")}
                    />
                    <label
                      class={`skill-label ${STATS[temporaryChoice].color}`}
                      for={specialsData.name}
                    >
                      <h3>
                        <img class="game-asset" src="/special-icon.png" />
                        {specialsData.name}
                      </h3>
                      <p>{specialsData.description}</p>
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
                      id={passive.name}
                      type="radio"
                      class="hide"
                      value={passive.name}
                      {...registerMoveset("A")}
                    />
                    <label
                      class={`skill-label ${STATS[temporaryChoice].color}`}
                      for={passive.name}
                    >
                      <h3>
                        <img
                          class="game-asset"
                          src={`/skills/${passive.name.replace(
                            fileReg,
                            ""
                          )}.png`}
                        />
                        {passive.name}
                      </h3>
                      <p>{passive.description}</p>
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
                      id={passive.name}
                      type="radio"
                      class="hide"
                      value={passive.name}
                      {...registerMoveset("B")}
                    />
                    <label
                      class={`skill-label ${STATS[temporaryChoice].color}`}
                      for={passive.name}
                    >
                      <h3>{passive.name}</h3>
                      <p>{passive.description}</p>
                    </label>
                  </Fragment>
                );
              })}
        </div>
        <div class="passive-c-list">
          <h2>Skill C</h2>
          {moveset &&
            [{ name: "No C", description: "" }]
              .concat(moveset.exclusiveSkills.C)
              .concat(moveset.commonSkills.C)
              .map((passive) => {
                return (
                  <Fragment key={passive.name}>
                    <input
                      id={passive.name}
                      type="radio"
                      class="hide"
                      value={passive.name}
                      {...registerMoveset("C")}
                    />
                    <label
                      class={`skill-label ${STATS[temporaryChoice].color}`}
                      for={passive.name}
                    >
                      <h3>{passive.name}</h3>
                      <p>{passive.description}</p>
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
                      id={passive.name}
                      type="radio"
                      class="hide"
                      value={passive.name}
                      {...registerMoveset("S")}
                    />
                    <label
                      class={`skill-label ${STATS[temporaryChoice].color}`}
                      for={passive.name}
                    >
                      <h3>{passive.name}</h3>
                      <p>{passive.description}</p>
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
                <td>{convertToLevel40(13, 75)}</td>
                <td>
                  <input
                    class="stat-input"
                    id="flaw-hp"
                    type="radio"
                    name="hp-change"
                    value="hp"
                  />
                  <label class="flaw" for="flaw-hp">
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id="neutral-hp"
                    type="radio"
                    checked
                    name="hp-change"
                    value="hp"
                  />
                  <label class="neutral" for="neutral-hp">
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id="asset-hp"
                    type="radio"
                    name="hp-change"
                    value="hp"
                  />
                  <label class="asset" for="asset-hp">
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Atk</td>
                <td>{convertToLevel40(13, 75)}</td>
                <td>
                  <input
                    class="stat-input"
                    id="flaw-atk"
                    type="radio"
                    name="atk-change"
                    value="atk"
                  />
                  <label class="flaw" for="flaw-atk">
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id="neutral-atk"
                    type="radio"
                    checked
                    name="atk-change"
                    value="atk"
                  />
                  <label class="neutral" for="neutral-atk">
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id="asset-atk"
                    type="radio"
                    name="atk-change"
                    value="atk"
                  />
                  <label class="asset" for="asset-atk">
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Spd</td>
                <td>{convertToLevel40(13, 75)}</td>
                <td>
                  <input
                    class="stat-input"
                    id="flaw-spd"
                    type="radio"
                    name="spd-change"
                    value="spd"
                  />
                  <label class="flaw" for="flaw-spd">
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id="neutral-spd"
                    type="radio"
                    checked
                    name="spd-change"
                    value="spd"
                  />
                  <label class="neutral" for="neutral-spd">
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id="asset-spd"
                    type="radio"
                    name="spd-change"
                    value="spd"
                  />
                  <label class="asset" for="asset-spd">
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Def</td>
                <td>{convertToLevel40(13, 75)}</td>
                <td>
                  <input
                    class="stat-input"
                    id="flaw-def"
                    type="radio"
                    name="def-change"
                    value="def"
                  />
                  <label class="flaw" for="flaw-def">
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id="neutral-def"
                    type="radio"
                    checked
                    name="def-change"
                    value="def"
                  />
                  <label class="neutral" for="neutral-def">
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id="asset-def"
                    type="radio"
                    name="def-change"
                    value="def"
                  />
                  <label class="asset" for="asset-def">
                    Asset
                  </label>
                </td>
              </tr>
              <tr>
                <td>Res</td>
                <td>{convertToLevel40(13, 75)}</td>
                <td>
                  <input
                    class="stat-input"
                    id="flaw-res"
                    type="radio"
                    name="res-change"
                    value="res"
                  />
                  <label class="flaw" for="flaw-res">
                    Flaw
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id="neutral-res"
                    type="radio"
                    name="res-change"
                    value="res"
                    checked
                  />
                  <label class="neutral" for="neutral-res">
                    Neutral
                  </label>
                </td>
                <td>
                  <input
                    class="stat-input"
                    id="asset-res"
                    type="radio"
                    name="res-change"
                    value="res"
                  />
                  <label class="asset" for="asset-res">
                    Asset
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="submit">test</div>
      </div>
    </>
  );
}
