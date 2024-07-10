import { Button, TabsContent, VisuallyHidden } from "@radix-ui/themes";
import { ReactNode, Ref, forwardRef, useEffect, useState } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Controller, useForm } from "react-hook-form";
import * as Label from "@radix-ui/react-label";
import * as Select from '@radix-ui/react-select';
import * as Accordion from '@radix-ui/react-accordion';
import { Grid, Slider } from "@radix-ui/themes";
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import styles from "./form-tab.module.scss";
import SkillScroller from "../SkillScroller";

function FormTab({ id, currentId, callback }: { id: string, currentId: string, callback: (details: Partial<HeroDetails>) => void }) {
  const [currentPanel, setCurrentPanel] = useState<"hero-list" | "hero-details">("hero-list");
  const [heroesList, setHeroesList] = useState<(RawHeroIdentity & ProcessedHeroStats)[]>([]);
  const [currentHero, setCurrentHero] = useState<RawHeroIdentity>({
    Name: "",
    MoveType: "",
    WeaponColor: "",
    WeaponType: ""
  });
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

  const [skillsList, setSkillsList] = useState<SkillList>({
    weapon: [],
    assist: [],
    special: [],
    passivea: [],
    passiveb: [],
    passivec: []
  })
  const heroDetailsForm = useForm<HeroDetails>();

  useEffect(() => {
    if (currentHero.Name) {
      fetch(`/api/skills?name=${encodeURIComponent(currentHero.Name)}&movementType=${currentHero.MoveType}&weaponType=${currentHero.WeaponType}&weaponColor=${currentHero.WeaponColor}`).then((response) => response.json()).then((data: SkillList) => {
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
        <form onSubmit={heroQueryForm.handleSubmit((heroesQuery) => {
          const searchParams = new URLSearchParams();
          for (let property in heroesQuery) {
            const castProperty = property as keyof typeof heroesQuery;
            if (heroesQuery[castProperty])  {
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
            <dl>
              <dt>
                <Label.Root htmlFor="name-input">Hero Name</Label.Root>
              </dt>
              <dd><input id="name-input" autoComplete="off" aria-labelledby='name' {...heroQueryForm.register("name", {
                pattern: /^[A-Z\p{Letter} ]+$/ui
              })} /></dd>
              <dt><label id="hero-color" htmlFor='color-selector'>
                Hero Color
              </label></dt>
              <dd>
                <select {...heroQueryForm.register("color")} aria-describedby='color-warning' id="color-selector" aria-labelledby='hero-color'>
                  <option></option>
                  <option>Red</option>
                  <option>Blue</option>
                  <option>Green</option>
                  <option>Colorless</option>
                </select>
              </dd>
              <dt><label id="hero-weapon" htmlFor='weapon-selector'>
                Hero Weapon
              </label></dt>
              <dd><select {...heroQueryForm.register("weaponType")} aria-describedby='hero-weapon' id="weapon-selector">
                <option></option>
                <optgroup label="Close Range">
                  <option>Sword</option>
                  <option>Lance</option>
                  <option>Axe</option>
                  <option>Beast</option>
                  <option>Breath</option>
                </optgroup>
                <optgroup label="Long Range">
                  <option>Bow</option>
                  <option>Tome</option>
                  <option>Dagger</option>
                  <option>Staff</option>
                </optgroup>
              </select></dd>
              <dt><label id="hero-movement" htmlFor='movement-selector'>Movement</label></dt>
              <dd>
                <select {...heroQueryForm.register("movement")} id="movement-selector" aria-labelledby='hero-movement'>
                  <option></option>
                  <option>Infantry</option>
                  <option>Armored</option>
                  <option>Flying</option>
                  <option>Cavalry</option>
                </select>
              </dd>
            </dl>
            <p id="color-warning">Color selection can be overriden by weapon choice, if only one color of that weapon exists (ex. Swords are always Red).</p>
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
                      <p id="test" style={{ width: "auto", textAlign: "center", wordWrap: "normal" }}>{sv.Name}</p>
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
          </table></>
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
              <p aria-label="Hero name">{currentHero.Name}</p>
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
            <div className={styles.StatModsGrid}>
              <div className={styles.HP}>HP</div><input type="radio" id={styles["hp-minus"]} name="hp" value="minus" style={{ display: "none" }} /><label htmlFor={styles["hp-minus"]}>Minus</label><input type="radio" id={styles["hp-neutral"]} name="hp" value="minus" style={{ display: "none" }} /><label htmlFor={styles["hp-neutral"]}>Neutral</label><input type="radio" id={styles["hp-plus"]} name="hp" value="plus" style={{ display: "none" }} /><label htmlFor={styles["hp-plus"]}>Plus</label>
              <div>Atk</div><label>Minus</label><label>Neutral</label><label>Plus</label>
              <div>Spd</div><label>Minus</label><label>Neutral</label><label>Plus</label>
              <div>Def</div><label>Minus</label><label>Neutral</label><label>Plus</label>
              <div>Res</div><label>Minus</label><label>Neutral</label><label>Plus</label>
            </div>
            <div>
              <h2>Merges</h2>
              <Slider onChange={console.log} min={0} max={10} step={1} defaultValue={[0]} />
            </div>
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

export default FormTab;
