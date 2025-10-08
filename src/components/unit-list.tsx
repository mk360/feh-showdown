import { ChangeEvent, memo, MouseEventHandler } from "preact/compat";
import { useContext, useState } from "preact/hooks";
import { useForm } from "react-hook-form";
import STATS from "../stats";
import TeamContext from "../team-context";
import { convertToSingleLevel40 } from "../stats/convert-to-level-40";
import getSortingFunction from "../utils/sort-functions";
import { capitalize, formatName } from "../utils/strings";
import WeaponCheckbox from "./weapon-checkbox";
import WEAPON_TREE from "../weapon-tree";
import DownArrow from "../../public/down-arrow.svg";

interface HeroFilters {
  characterName: string;
  color: string[];
  weapons: string[];
  movement: string[];
}

function getResultsFromFilters(filters: HeroFilters, currentTeam: string[]) {
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

    conditions.push(!currentTeam.includes(hero));

    if (conditions.every((val) => val === true)) {
      collectedResults.push(hero);
    }
  }

  return collectedResults;
}

function UnitList({
  index,
  onUnitClick,
}: {
  index: number;
  onUnitClick: MouseEventHandler<HTMLTableSectionElement>;
}) {
  const { register, handleSubmit, reset, setValue, getValues, formState: { isSubmitted } } = useForm<HeroFilters>({
    defaultValues: {
      characterName: "",
      color: [],
      weapons: [],
      movement: [],
    },
    mode: "onTouched",
  });
  const { teamPreview } = useContext(TeamContext);
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
          setResults(getResultsFromFilters(data, teamPreview.map((i) => i.name).filter((i) => i)));
        })}
      >
        <table>
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    // @ts-ignore
                    if (e.target.checked) {
                      setValue("color", Array.from(new Set(getValues("color").concat("red"))));
                      const availableWeapons = ["red-sword", "red-tome", "red-bow", "red-breath", "red-dagger", "red-beast"].filter((weapon) => {
                        const [, weaponType] = weapon.split("-");
                        return !!WEAPON_TREE["red"][weaponType];
                      });

                      setValue("weapons", Array.from(new Set(getValues("weapons").concat(availableWeapons))));
                    } else {
                      setValue("color", getValues("color").filter((i) => i !== "red"));
                      const weapons = getValues("weapons");
                      for (let weapon of ["red-sword", "red-tome", "red-bow", "red-breath", "red-dagger", "red-beast"]) {
                        weapons.splice(weapons.indexOf(weapon), 1);
                      }
                      setValue("weapons", weapons);
                    }
                  }}
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
                  onChange={(e) => {
                    // @ts-ignore
                    if (e.target.checked) {
                      setValue("color", Array.from(new Set(getValues("color").concat("blue"))));
                      const availableWeapons = ["blue-lance", "blue-tome", "blue-bow", "blue-breath", "blue-dagger", "blue-beast"].filter((weapon) => {
                        const [, weaponType] = weapon.split("-");
                        return !!WEAPON_TREE["blue"][weaponType];
                      });
                      setValue("weapons", Array.from(new Set(getValues("weapons").concat(availableWeapons))));
                    } else {
                      setValue("color", getValues("color").filter((i) => i !== "blue"));
                      const weapons = getValues("weapons");
                      for (let weapon of ["blue-lance", "blue-tome", "blue-bow", "blue-breath", "blue-dagger", "blue-beast"]) {
                        weapons.splice(weapons.indexOf(weapon), 1);
                      }
                      setValue("weapons", weapons);
                    }
                  }}
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
                  onChange={(e) => {
                    // @ts-ignore
                    if (e.target.checked) {
                      setValue("color", Array.from(new Set(getValues("color").concat("green"))));
                      const availableWeapons = ["green-axe", "green-tome", "green-bow", "green-breath", "green-dagger", "green-beast"].filter((weapon) => {
                        const [, weaponType] = weapon.split("-");
                        return !!WEAPON_TREE["green"][weaponType];
                      });
                      setValue("weapons", Array.from(new Set(getValues("weapons").concat(availableWeapons))));
                    } else {
                      setValue("color", getValues("color").filter((i) => i !== "green"));
                      const weapons = getValues("weapons");
                      for (let weapon of ["green-axe", "green-tome", "green-bow", "green-breath", "green-dagger", "green-beast"]) {
                        weapons.splice(weapons.indexOf(weapon), 1);
                      }
                      setValue("weapons", weapons);
                    }
                  }}
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
                  onChange={(e) => {
                    // @ts-ignore
                    if (e.target.checked) {
                      setValue("color", Array.from(new Set(getValues("color").concat("colorless"))));
                      const availableWeapons = ["colorless-staff", "colorless-tome", "colorless-bow", "colorless-breath", "colorless-dagger", "colorless-beast"].filter((weapon) => {
                        const [, weaponType] = weapon.split("-");
                        return !!WEAPON_TREE["colorless"][weaponType];
                      });
                      setValue("weapons", Array.from(new Set(getValues("weapons").concat(availableWeapons))));
                    } else {
                      setValue("color", getValues("color").filter((i) => i !== "colorless"));
                      const weapons = getValues("weapons");
                      for (let weapon of ["colorless-staff", "colorless-tome", "colorless-bow", "colorless-breath", "colorless-dagger", "colorless-beast"]) {
                        weapons.splice(weapons.indexOf(weapon), 1);
                      }
                      setValue("weapons", weapons);
                    }
                  }}
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
                  value="Search for Units"
                  style="height: 100%; padding: 30px; width: 100%; background-color: #FF6A3D; border: none; cursor: pointer"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <div class="results" style={{ position: "relative" }}>
        {isSubmitted && (
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
                <div class={"unit-list-header"}><span>HP</span>
                  {sorting.hp === "ascending" ? <img style={{ transform: "rotate(180deg)"}} src={DownArrow} /> : sorting.hp === "descending" ? <img src={DownArrow} /> : null}
                </div>
              </th>
              <th
                onClick={() => {
                  sort("atk");
                }}
                class="Atk"
              >
                <div class={"unit-list-header"}><span>Atk</span>
                  {sorting.atk === "ascending" ? <img style={{ transform: "rotate(180deg)"}} src={DownArrow} /> : sorting.atk === "descending" ? <img src={DownArrow} /> : null}
                </div>
              </th>
              <th
                onClick={() => {
                  sort("spd");
                }}
                class="Spd"
              >
                <div class={"unit-list-header"}><span>Spd</span>
                  {sorting.spd === "ascending" ? <img style={{ transform: "rotate(180deg)"}} src={DownArrow} /> : sorting.spd === "descending" ? <img src={DownArrow} /> : null}
                </div>
              </th>
              <th
                onClick={() => {
                  sort("def");
                }}
                class="Def"
              >
                <div class={"unit-list-header"}><span>Def</span>
                  {sorting.def === "ascending" ? <img style={{ transform: "rotate(180deg)"}} src={DownArrow} /> : sorting.def === "descending" ? <img src={DownArrow} /> : null}
                </div>
              </th>
              <th
                onClick={() => {
                  sort("res");
                }}
                class="Res"
              >
                <div class={"unit-list-header"}><span>Res</span>
                  {sorting.res === "ascending" ? <img style={{ transform: "rotate(180deg)"}} src={DownArrow} /> : sorting.res === "descending" ? <img src={DownArrow} /> : null}
                  </div>
              </th>
              <th
                onClick={() => {
                  sort("bst");
                }}
                class="BST"
              >
                <div class={"unit-list-header"}><span>BST</span>
                  {sorting.bst === "ascending" ? <img style={{ transform: "rotate(180deg)"}} src={DownArrow} /> : sorting.bst === "descending" ? <img src={DownArrow} /> : null}
                </div>
              </th>
            </tr>
          </thead>
          <tbody onClick={(e) => {
            setResults([]);
            onUnitClick(e);
            reset();
          }}>
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
        )}
      </div>
    </div>
  );
}

export default memo(UnitList);
