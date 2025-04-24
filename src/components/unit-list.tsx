import { useState } from "preact/hooks";
import { useForm } from "react-hook-form";
import convertToSingleLevel40 from "../utils/convert-to-level-40";
import WeaponCheckbox from "./weapon-checkbox";
import { capitalize, formatName } from "../utils/strings";
import { memo, MouseEventHandler } from "preact/compat";
import getSortingFunction from "../utils/sort-functions";
import STATS from "../stats";

interface HeroFilters {
  characterName: string;
  color: string[];
  weapons: string[];
  movement: string[];
}

function getResultsFromFilters(filters: HeroFilters) {
  let collectedResults: string[] = [];

  for (let hero in STATS) {
    const heroData = STATS[hero as keyof typeof STATS];

    const conditions: boolean[] = [];

    if (filters.color.length) {
      conditions.push(filters.color.includes(heroData.color));
    }

    if (filters.weapons.length) {
      conditions.push(
        filters.weapons.includes(heroData.color + "-" + heroData.weaponType)
      );
    }

    if (filters.movement.length) {
      conditions.push(filters.movement.includes(heroData.movementType));
    }

    if (conditions.every((val) => val === true)) {
      collectedResults.push(hero);
    }
  }

  return Array.from(new Set(collectedResults));
}

function UnitList({
  index,
  onUnitClick,
}: {
  index: number;
  onUnitClick: MouseEventHandler<HTMLTableSectionElement>;
}) {
  const { register, handleSubmit } = useForm<HeroFilters>({
    defaultValues: {
      characterName: "",
      color: [],
      weapons: [],
      movement: [],
    },
    mode: "onTouched",
  });
  const [results, setResults] = useState<string[]>([]);
  const [sorting, setSorting] = useState<{
    [k in FEH_Stat | "name" | "bst"]: "ascending" | "descending" | "";
  }>({
    name: "",
    hp: "",
    atk: "",
    spd: "",
    def: "",
    res: "",
    bst: "",
  });

  function sort(key: FEH_Stat | "name" | "bst") {
    const newDirection = ["ascending", ""].includes(sorting[key])
      ? "descending"
      : "ascending";
    setSorting({
      name: "",
      hp: "",
      atk: "",
      spd: "",
      def: "",
      res: "",
      bst: "",
      [key]: newDirection,
    });
  }

  const sortingFunction = getSortingFunction(sorting);

  return (
    <div>
      <form
        onSubmit={handleSubmit((data) => {
          setResults(getResultsFromFilters(data));
        })}
      >
        <table>
          <thead>
            {/* <tr>
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
            */}
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
                  value="red"
                  class="red"
                  id={`${index}-red`}
                  type="checkbox"
                  {...register("color")}
                />
                <label for={`${index}-red`}>
                  <img class="game-asset" src="/teambuilder/red.png" />
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
                  <img class="game-asset" src="/teambuilder/blue.png" />
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
                  <img class="game-asset" src="/teambuilder/green.png" />
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
                  <img class="game-asset" src="/teambuilder/colorless.png" />
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
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="blue"
                  weapon="lance"
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
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="blue"
                  weapon="tome"
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="green"
                  weapon="tome"
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="colorless"
                  weapon="tome"
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
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="blue"
                  weapon="bow"
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="green"
                  weapon="bow"
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="colorless"
                  weapon="bow"
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
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="blue"
                  weapon="breath"
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="green"
                  weapon="breath"
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="colorless"
                  weapon="breath"
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
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="blue"
                  weapon="dagger"
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="green"
                  weapon="dagger"
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="colorless"
                  weapon="dagger"
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
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="blue"
                  weapon="beast"
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="green"
                  weapon="beast"
                />
              </td>
              <td>
                <WeaponCheckbox
                  register={register}
                  index={index}
                  color="colorless"
                  weapon="beast"
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
            <tr>
              <td colSpan={4}>
                <input
                  type="submit"
                  style="height: 100%; padding: 30px; width: 100%"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <div class="results">
        <table>
          <thead>
            <tr>
              <th
                onClick={() => {
                  sort("name");
                }}
                rowSpan={2}
              >
                Name
              </th>
              <th colSpan={6}>5 Stars Level 40</th>
            </tr>
            <tr>
              <th
                onClick={() => {
                  sort("hp");
                }}
                class="HP"
              >
                HP
              </th>
              <th
                onClick={() => {
                  sort("atk");
                }}
                class="Atk"
              >
                Atk
              </th>
              <th
                onClick={() => {
                  sort("spd");
                }}
                class="Spd"
              >
                Spd
              </th>
              <th
                onClick={() => {
                  sort("def");
                }}
                class="Def"
              >
                Def
              </th>
              <th
                onClick={() => {
                  sort("res");
                }}
                class="Res"
              >
                Res
              </th>
              <th
                onClick={() => {
                  sort("bst");
                }}
                class="BST"
              >
                BST
              </th>
            </tr>
          </thead>
          <tbody onClick={onUnitClick}>
            {results
              .map((result) => {
                const stats = STATS[result];
                const convertedStats = {
                  hp: convertToSingleLevel40(
                    stats.lv1.hp,
                    stats.growthRates.hp
                  ),
                  atk: convertToSingleLevel40(
                    stats.lv1.atk,
                    stats.growthRates.atk
                  ),
                  spd: convertToSingleLevel40(
                    stats.lv1.spd,
                    stats.growthRates.spd
                  ),
                  def: convertToSingleLevel40(
                    stats.lv1.def,
                    stats.growthRates.def
                  ),
                  res: convertToSingleLevel40(
                    stats.lv1.res,
                    stats.growthRates.res
                  ),
                };

                return {
                  ...convertedStats,
                  name: result,
                };
              })
              .sort(sortingFunction)
              .map(({ name: result, ...stats }) => {
                const formattedName = formatName(result);
                const { color, movementType, weaponType } = STATS[result];
                return (
                  <tr id={result} key={result}>
                    <td class="portrait-cell">
                      <div class="thumbnail">
                        <img
                          class="portrait loading"
                          src={`/teambuilder/thumbnails/${formattedName}.webp`}
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
                            movementType
                          )}.png`}
                        />
                        <img
                          class="weapon-icon"
                          src={`https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Class_${[
                            color,
                            weaponType,
                          ]
                            .map(capitalize)
                            .join("_")}.png`}
                        />
                      </div>
                      {result}
                      <div />
                    </td>
                    <td class="HP">{stats.hp}</td>
                    <td class="Atk">{stats.atk}</td>
                    <td class="Spd">{stats.spd}</td>
                    <td class="Def">{stats.def}</td>
                    <td class="Res">{stats.res}</td>
                    <td class="BST">
                      {stats.hp + stats.atk + stats.spd + stats.def + stats.res}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(UnitList);
