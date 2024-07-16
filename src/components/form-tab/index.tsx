import { Button, Select, SelectContent, Skeleton, TabsContent } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as Label from "@radix-ui/react-label";
import { Grid, Slider } from "@radix-ui/themes";
import styles from "./form-tab.module.scss";
import SkillScroller from "../SkillScroller";
import getLv40Stat from "@/utils/get-lv40-stats";

function FormTab({ id, currentId, callback }: { id: string, currentId: string, callback: (details: Partial<HeroDetails>) => void }) {
  const [currentPanel, setCurrentPanel] = useState<"hero-list" | "hero-details">("hero-list");
  const [heroesList, setHeroesList] = useState<(RawHeroIdentity & ProcessedHeroStats)[]>([]);
  const [currentHero, setCurrentHero] = useState<RawHeroIdentity>({
    Name: "",
    MoveType: "",
    WeaponColor: "",
    WeaponType: ""
  });
  const [boon, setBoon] = useState<Stats | "">("");
  const [bane, setBane] = useState<Stats | "">("");
  const heroQueryForm = useForm<{
    name: string;
    color: string;
    movement: string;
    weaponType: string;
  }>({
    defaultValues: {
      name: undefined,
      color: undefined,
      movement: undefined,
      weaponType: undefined
    }
  });

  const [skillsList, setSkillsList] = useState<SkillList & Partial<RawHeroStats>>({
    weapon: [],
    assist: [],
    special: [],
    passivea: [],
    passiveb: [],
    passivec: [],
  });
  const heroDetailsForm = useForm<HeroDetails>();

  useEffect(() => {
    if (currentHero.Name) {
      fetch(`/api/skills?name=${encodeURIComponent(currentHero.Name)}&movementType=${currentHero.MoveType}&weaponType=${currentHero.WeaponType}&weaponColor=${currentHero.WeaponColor}`).then((response) => response.json()).then((data: SkillList & RawHeroStats) => {
        setSkillsList(data);
      });
    }
  }, [currentHero.Name]);

  useEffect(() => {
    heroDetailsForm.reset();
    setSkillsList({
      weapon: [],
      assist: [],
      special: [],
      passivea: [],
      passiveb: [],
      passivec: [],
    });
  }, [currentHero.Name]);

  // maybe try a select inside an accordion?

  return (
    <TabsContent forceMount hidden={currentId !== id} value={id}>
      <div style={{ display: currentPanel !== "hero-list" ? "none" : "block" }}>
        <form className={styles.heroSearch} onSubmit={heroQueryForm.handleSubmit((heroesQuery) => {
          const searchParams = new URLSearchParams();
          for (let property in heroesQuery) {
            const castProperty = property as keyof typeof heroesQuery;
            if (heroesQuery[castProperty].length)  {

              searchParams.set(property, heroesQuery[castProperty]);
            }
          }

          const fullUrl = `/api/heroes` + (searchParams.size ? `?${searchParams.toString()}` : "");

          fetch(fullUrl).then((res) => {
            res.json().then((v) => {
              setHeroesList(v);
            });
          });
        }, (errors) => {
          console.log({ errors });
        })} style={{ width: "100%" }}>
          <fieldset>
            <legend>Filters</legend>
            <div style={{ padding: 6 }}>
              <Label.Root htmlFor={`name-input-${id}`} style={{ textAlign: "center" }}>Hero Name</Label.Root>
              <div><input placeholder="Enter a name" style={{ width: "100%", padding: 2 }} id='name-input' {...heroQueryForm.register("name", {
                pattern: /^[A-Z\p{Letter} ]+$/ui
              })} /></div>
            </div>
            <table className={styles.formTable}>
              <caption>Color</caption>
              <tr><td><input className={styles.filterInput} type="checkbox" {...heroQueryForm.register("color")} value="Red" id={`red-${id}`} /><label htmlFor={`red-${id}`}>Red</label></td>
              <td><input className={styles.filterInput} type="checkbox" {...heroQueryForm.register("color")} value="Blue" id={`blue-${id}`} /><label htmlFor={`blue-${id}`}>Blue</label></td></tr>
              <tr><td><input className={styles.filterInput} type="checkbox" {...heroQueryForm.register("color")} value="Green" id={`green-${id}`} /><label htmlFor={`green-${id}`}>Green</label></td><td><input className={styles.filterInput} type="checkbox" {...heroQueryForm.register("color")} value="Colorless" id={`colorless-${id}`} /><label htmlFor={`colorless-${id}`}>Colorless</label></td></tr>
            </table>
            <table className={styles.formTable}>
              <caption>Weapon</caption>
              <tr>
                <td>
                  <input type="checkbox" id={`red-sword-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Red Sword" />
                  <label htmlFor={`red-sword-${id}`}>Red Sword</label>
                </td>
                <td>
                  <input type="checkbox" id={`blue-lance-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Blue Lance" />
                  <label htmlFor={`blue-lance-${id}`}>Blue Lance</label>
                </td>
                <td>
                  <input type="checkbox" id={`green-axe-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Green Axe" />
                  <label htmlFor={`green-axe-${id}`}>Green Axe</label>
                </td>
                <td>
                  <input type="checkbox" id={`colorless-staff-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Colorless Staff" />
                  <label htmlFor={`colorless-staff-${id}`}>Colorless Staff</label>
                </td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" id={`red-bow-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Red Bow" />
                  <label htmlFor={`red-bow-${id}`}>Red Bow</label>
                </td>
                <td>
                  <input type="checkbox" id={`blue-bow-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Blue Bow" />
                  <label htmlFor={`blue-bow-${id}`}>Blue Bow</label>
                </td>
                <td>
                  <input type="checkbox" id={`green-bow-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Green Bow" />
                  <label htmlFor={`green-bow-${id}`}>Green Bow</label>
                </td>
                <td>
                  <input type="checkbox" id={`colorless-bow-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Colorless Bow" />
                  <label htmlFor={`colorless-bow-${id}`}>Colorless Bow</label>
                </td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" id={`red-tome-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Red Tome" />
                  <label htmlFor={`red-tome-${id}`}>Red Tome</label>
                </td>
                <td>
                  <input type="checkbox" id={`blue-tome-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Blue Tome" />
                  <label htmlFor={`blue-tome-${id}`}>Blue Tome</label>
                </td>
                <td>
                  <input type="checkbox" id={`green-tome-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Green Tome" />
                  <label htmlFor={`green-tome-${id}`}>Green Tome</label>
                </td>
                <td>
                  <input type="checkbox" id={`colorless-tome-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Colorless Tome" />
                  <label htmlFor={`colorless-tome-${id}`}>Colorless Tome</label>
                </td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" id={`red-breath-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Red Breath" />
                  <label htmlFor={`red-breath-${id}`}>Red Breath</label>
                </td>
                <td>
                  <input type="checkbox" id={`blue-breath-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Blue Breath" />
                  <label htmlFor={`blue-breath-${id}`}>Blue Breath</label>
                </td>
                <td>
                  <input type="checkbox" id={`green-breath-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Green Breath" />
                  <label htmlFor={`green-breath-${id}`}>Green Breath</label>
                </td>
                <td>
                  <input type="checkbox" id={`colorless-breath-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Colorless Breath" />
                  <label htmlFor={`colorless-breath-${id}`}>Colorless Breath</label>
                </td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" id={`red-beast-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Red Beast" />
                  <label htmlFor={`red-beast-${id}`}>Red Beast</label>
                </td>
                <td>
                  <input type="checkbox" id={`blue-beast-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Blue Beast" />
                  <label htmlFor={`blue-beast-${id}`}>Blue Beast</label>
                </td>
                <td>
                  <input type="checkbox" id={`green-beast-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Green Beast" />
                  <label htmlFor={`green-beast-${id}`}>Green Beast</label>
                </td>
                <td>
                  <input type="checkbox" id={`colorless-beast-${id}`} className={styles.filterInput} {...heroQueryForm.register("weaponType")} value="Colorless Beast" />
                  <label htmlFor={`colorless-beast-${id}`}>Colorless Beast</label>
                </td>
              </tr>
            </table>
            <table className={styles.formTable}>
              <caption>Movement</caption>
              <tr>
                <td><input className={styles.filterInput} type="checkbox" {...heroQueryForm.register("movement")} value="Infantry" id={`infantry-${id}`} /><label htmlFor={`infantry-${id}`}>Infantry</label></td>
                <td><input className={styles.filterInput} type="checkbox" {...heroQueryForm.register("movement")} value="Armored" id={`armored-${id}`} /><label htmlFor={`armored-${id}`}>Armored</label></td>
                <td><input className={styles.filterInput} type="checkbox" {...heroQueryForm.register("movement")} value="Cavalry" id={`cavalry-${id}`} /><label htmlFor={`cavalry-${id}`}>Cavalry</label></td>
                <td><input className={styles.filterInput} type="checkbox" {...heroQueryForm.register("movement")} value="Flying" id={`flying-${id}`} /><label htmlFor={`flying-${id}`}>Flying</label></td>
              </tr>
            </table>

            <Button type="submit">Find Heroes</Button>
          </fieldset>
        </form>
        {heroQueryForm.formState.isSubmitSuccessful && !heroQueryForm.formState.isLoading && (<><div aria-relevant="all" aria-live="polite">
          Found {heroesList.length} results.
        </div>
        <table style={{ width: "100%" }}>
          <thead>
              <tr>
                <th><button>Hero</button></th>
                <th><button>Movement</button></th>
                <th><button>Color</button></th>
                <th><button>Weapon</button></th>
                <th><button>HP</button></th>
                <th><button>Atk</button></th>
                <th><button>Spd</button></th>
                <th><button>Def</button></th>
                <th><button>Res</button></th>
                <th><button>BST</button></th>
              </tr>
          </thead>
          <tbody onClick={(e) => {
              // console.log(e.target, e.currentTarget);
            }}>
              {heroesList.map((sv) => (
                <tr key={sv.Name} style={{ backgroundColor: colorToBackgroundColor(sv.WeaponColor) }} onClick={() => {
                  setCurrentHero(sv);
                  setCurrentPanel("hero-details");
                }}
                >
                  <td style={{ display: "flex" }}>
                    <div style={{ flex: 0.2, display: "flex", justifyContent: "center", padding: 6 }}>
                      <img style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 6 }} height={60} width={60} loading="lazy" src={`/api/portrait?name=${encodeURIComponent(sv.Name)}`} />
                    </div>
                    <div style={{ display: "flex", flex: 0.3, justifyContent: "center", alignItems: "center" }}>
                      <p id={`test-${id}`} style={{ width: "auto", textAlign: "center", wordWrap: "normal" }}>{sv.Name}</p>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: 6 }}>{sv.MoveType}</td>
                  <td style={{ textAlign: "center", padding: 6 }}>{sv.WeaponColor}</td>
                  <td style={{ textAlign: "center", padding: 6 }}>{sv.WeaponType}</td>
                  <td style={{ textAlign: "center", padding: 6 }}>{sv.hp}</td>
                  <td style={{ textAlign: "center", padding: 6 }}>{sv.atk}</td>
                  <td style={{ textAlign: "center", padding: 6 }}>{sv.spd}</td>
                  <td style={{ textAlign: "center", padding: 6 }}>{sv.def}</td>
                  <td style={{ textAlign: "center", padding: 6 }}>{sv.res}</td>
                  <td style={{ textAlign: "center", padding: 6 }}>{sv.bst}</td>
                </tr>
              ))}
          </tbody>
          </table>
          </>
        )}
      </div>
      <div style={{ display: currentPanel !== "hero-details" ? "none" : "block", padding: 10 }}>
        <form onSubmit={heroDetailsForm.handleSubmit((heroDetails) => {
          callback({ ...heroDetails, ...currentHero });
        })}>
          <div>
            <Button onClick={() => {
              setHeroesList([]);
              heroQueryForm.reset();
              setCurrentHero({
                Name: "",
                WeaponColor: "",
                WeaponType: "",
                MoveType: ""
              });
              setCurrentPanel("hero-list");
            }} variant="surface">
              Go Back
            </Button>
          </div>
          <section style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div>
                <img src={`/api/portrait?name=${encodeURIComponent(currentHero.Name)}`} loading="lazy" alt="" height={120} width={120} style={{ margin: "auto" }} />
              </div>
              <p>{currentHero.Name}</p>
              <p>{currentHero.WeaponColor} {currentHero.WeaponType} {currentHero.MoveType}</p>
            </div>
            <div>
              <div className={styles.MovesetSlot}>
                <Label.Root>
                  Weapon
                </Label.Root>
                <input defaultValue={heroDetailsForm.getValues("weapon")} disabled />
              </div>
              <div className={styles.MovesetSlot}>
                <Label.Root>
                  Assist
                </Label.Root>
                <input defaultValue={heroDetailsForm.getValues("assist")} disabled />
              </div>
              <div className={styles.MovesetSlot}>
                <Label.Root>
                  Special
                </Label.Root>
                <input defaultValue={heroDetailsForm.getValues("special")} disabled />
              </div>
              <div className={styles.MovesetSlot}>
                <Label.Root>
                  A
                </Label.Root>
                <input defaultValue={heroDetailsForm.getValues("passivea")} disabled />
              </div>
              <div className={styles.MovesetSlot}>
                <Label.Root>
                  B
                </Label.Root>
                <input defaultValue={heroDetailsForm.getValues("passiveb")} disabled />
              </div>
              <div className={styles.MovesetSlot}>
                <Label.Root>
                  C
                </Label.Root>
                <input defaultValue={heroDetailsForm.getValues("passivec")} disabled />
              </div>
            </div>
          </section>
          <div>
              <h2>Merges</h2>
              <Select.Root>
                <Select.Trigger></Select.Trigger>
                <SelectContent>
                  <Select.Item value="0">0</Select.Item>
                  <Select.Item value="1">1</Select.Item>
                  <Select.Item value="2">2</Select.Item>
                  <Select.Item value="3">3</Select.Item>
                  <Select.Item value="4">4</Select.Item>
                  <Select.Item value="5">5</Select.Item>
                  <Select.Item value="6">6</Select.Item>
                  <Select.Item value="7">7</Select.Item>
                  <Select.Item value="8">8</Select.Item>
                  <Select.Item value="9">9</Select.Item>
                  <Select.Item value="10">10</Select.Item>
                </SelectContent>
              </Select.Root>
          </div>
          <div>
            <h2>Nature</h2>
            <h3>Boon</h3>
            <Select.Root onValueChange={(boon: Stats | "") => setBoon(boon)} value={boon}>
              <Select.Trigger></Select.Trigger>
              <SelectContent>
                <Select.Item value="neutral">Neutral</Select.Item>
                <Select.Item value="HP">HP</Select.Item>
                <Select.Item value="Atk">Atk</Select.Item>
                <Select.Item value="Spd">Spd</Select.Item>
                <Select.Item value="Def">Def</Select.Item>
                <Select.Item value="Res">Res</Select.Item>
              </SelectContent>
            </Select.Root>
            <h3>Bane</h3>
            <Select.Root onValueChange={(bane: Stats | "") => setBane(bane)} value={bane}>
              <Select.Trigger></Select.Trigger>
              <SelectContent>
                <Select.Item value="neutral">Neutral</Select.Item>
                <Select.Item value="HP">HP</Select.Item>
                <Select.Item value="Atk">Atk</Select.Item>
                <Select.Item value="Spd">Spd</Select.Item>
                <Select.Item value="Def">Def</Select.Item>
                <Select.Item value="Res">Res</Select.Item>
              </SelectContent>
            </Select.Root>
          </div>
          <div>
              <Skeleton loading={!skillsList.AtkGR3}>
                <table className={styles.formTable}>
                  <thead>
                    <tr>
                      <th>HP</th>
                      <th>Atk</th>
                      <th>Spd</th>
                      <th>Def</th>
                      <th>Res</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{getLv40Stat(+skillsList.Lv1HP5!, getProperGrowthRate("HP", boon, bane, +skillsList.HPGR3!), boon === "HP", bane === "HP")}</td>
                      <td>{getLv40Stat(+skillsList.Lv1Atk5!, getProperGrowthRate("Atk", boon, bane, +skillsList.AtkGR3!), boon === "Atk", bane === "Atk")}</td>
                      <td>{getLv40Stat(+skillsList.Lv1Spd5!, getProperGrowthRate("Spd", boon, bane, +skillsList.SpdGR3!), boon === "Spd", bane === "Spd")}</td>
                      <td>{getLv40Stat(+skillsList.Lv1Def5!, getProperGrowthRate("Def", boon, bane, +skillsList.DefGR3!), boon === "Def", bane === "Def")}</td>
                      <td>{getLv40Stat(+skillsList.Lv1Res5!, getProperGrowthRate("Res", boon, bane, +skillsList.ResGR3!), boon === "Res", bane === "Res")}</td>
                    </tr>
                  </tbody>
                </table>
              </Skeleton>
          </div>
          <div>
            <h2>Skills</h2>
            <Grid columns="2" gap="6">
              <div>
                <h3>Weapons</h3>
                <Controller control={heroDetailsForm.control} name="weapon" render={({ field }) => {
                  return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.weapon} />
                }} />
              </div>
              <div>
                <h3>Assists</h3>
                <Controller control={heroDetailsForm.control} name="assist" render={({ field }) => {
                  return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.assist} />
                }} />
              </div>
              <div>
                <h3>Specials</h3>
                <Controller control={heroDetailsForm.control} name="special" render={({ field }) => {
                  return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.special} />
                }} />
              </div>
              <div>
                <h3>A Passives</h3>
                <Controller control={heroDetailsForm.control} name="passivea" render={({ field }) => {
                  return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.passivea} />
                }} />
              </div>
              <div>
                <h3>B Passives</h3>
                <Controller control={heroDetailsForm.control} name="passiveb" render={({ field }) => {
                  return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.passiveb} />
                }} />
              </div>
              <div>
                <h3>C Passives</h3>
                <Controller control={heroDetailsForm.control} name="passivec" render={({ field }) => {
                  return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.passivec} />
                }} />
              </div>
            </Grid>
            <Button style={{
              transition: "background-color color",
              transitionDuration: "200ms"
            }} disabled={!heroDetailsForm.formState.isDirty} type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </TabsContent>
  );
};

function colorToBackgroundColor(color: string) {
  switch (color) {
    case "Red": return `rgba(255, 0, 0, 0.4)`;
    case "Green": return `rgba(0, 255, 0, 0.4)`;
    case "Blue": return `rgba(0, 0, 255, 0.4)`;
    case "Colorless": return `rgba(200, 200, 200, 0.4)`
  }
}

function getProperGrowthRate(stat: Stats, boon: Stats | "", bane: Stats | "", baseGrowthRate: number) {
  if (stat === boon) return baseGrowthRate + 5;
  if (stat === bane) return baseGrowthRate - 5;
  return baseGrowthRate;
}

export default FormTab;
