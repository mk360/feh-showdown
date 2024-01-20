import { Button, TabsContent, VisuallyHidden } from "@radix-ui/themes";
import { ReactNode, Ref, forwardRef, useEffect, useState } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Controller, useForm } from "react-hook-form";
import * as Label from "@radix-ui/react-label";
import * as Select from '@radix-ui/react-select';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import styles from "./form-tab.module.scss";
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import SkillScroller from "../SkillScroller";


const SelectItem = forwardRef(({ children, className, ...props }: { children: ReactNode, className: string } & any, forwardedRef: Ref<any>) => {
  return (
    <Select.Item className={`SelectItem ${className}`} {...props} ref={forwardedRef}>
      <Select.ItemText><div>{children}</div></Select.ItemText>
      <Select.ItemIndicator className="SelectItemIndicator">
        <ChevronRightIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

function FormTab({ id, currentId, callback }: { id: string, currentId: string, callback: (details: Partial<HeroDetails>) => void}) {
    const [currentPanel, setCurrentPanel] = useState<"hero-list" | "hero-details">("hero-list");
    const [heroesList, setHeroesList] = useState<(RawHeroIdentity & ProcessedHeroStats)[]>([]);
    const [currentHero, setCurrentHero] = useState<{
        name: string;
        movementType: string;
        weaponType: string;
        weaponColor: string;
    }>({
        name: "",
        movementType: "",
        weaponColor: "",
        weaponType: ""
    });
    const heroQueryForm = useForm<{
        name: string;
        color: string;
        movement: string;
        weaponType: string;
    }>();
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
      if (currentHero.name) {
        fetch(`/api/skills?name=${encodeURIComponent(currentHero.name)}&movementType=${currentHero.movementType}&weaponType=${currentHero.weaponType}&weaponColor=${currentHero.weaponColor}`).then((response) => response.json()).then((data: SkillList) => {
          setSkillsList(data);
        });
      }
    }, [currentHero.name]);

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
    }, [currentHero.name]);

    // maybe try a select inside an accordion?

    return (
        <TabsContent forceMount hidden={currentId !== id} value={id}>
            <div style={{ display: currentPanel !== "hero-list" ? "none" : "block" }}>
                <form onSubmit={heroQueryForm.handleSubmit((heroesQuery) => {
                    const s = new URLSearchParams(heroesQuery).toString();
                    fetch(`/api/heroes?${s}`).then((res) => {
                        res.json().then((v) => {
                            setHeroesList(v);
                        });
                    });
                })} style={{ width: "100%" }}>
                    <fieldset>
                    <legend>Filters</legend>
                    <dl>
                        <dt>
                            <Label.Root htmlFor="name-input">Hero Name</Label.Root>
                        </dt>
                        <dd><input id="name-input" autoComplete="off" aria-labelledby='name' {...heroQueryForm.register("name")} /></dd>
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
                {heroQueryForm.formState.isSubmitSuccessful && (<><div aria-relevant="all" aria-live="polite">
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
                          <tr key={sv.Name} onClick={() => {
                            setCurrentHero({
                                name: sv.Name,
                                movementType: sv.MoveType,
                                weaponType: sv.WeaponType,
                                weaponColor: sv.WeaponColor
                            });
                            setCurrentPanel("hero-details");
                          }}
                          >
                          <td style={{ display: "flex" }}>
                              <div style={{ flex: 0.5, display: "flex", justifyContent: "center" }}>
                              <img height={60} width={60} loading="lazy" src={`/api/portrait?name=${encodeURIComponent(sv.Name)}`} />
                              </div>
                              <div style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <p id="test" style={{ width: "auto", textAlign: "center", wordWrap: "normal" }}>{sv.Name}</p>
                              </div>
                          </td>
                          <td>{sv.MoveType}</td>
                          <td>{sv.WeaponColor}</td>
                          <td>{sv.WeaponType}</td>
                          <td>{sv.hp}</td>
                          <td>{sv.atk}</td>
                          <td>{sv.spd}</td>
                          <td>{sv.def}</td>
                          <td>{sv.res}</td>
                          <td>{sv.bst}</td>
                          </tr>
                      ))}
                    </tbody>
                </table></>
                )}
            </div>
            <div style={{ display: currentPanel !== "hero-details" ? "none" : "block"}}>
              <form onSubmit={heroDetailsForm.handleSubmit((heroDetails) => {
                console.log({ heroDetails });
                callback({...heroDetails, ...currentHero });
              })}>
                <div>
                  <Button onClick={() => {
                    setHeroesList([]);
                    heroQueryForm.reset();
                    setCurrentHero({
                      name: "",
                      weaponColor: "",
                      weaponType: "",
                      movementType: ""
                    });
                    setCurrentPanel("hero-list");
                  }} variant="surface">
                    Go Back
                  </Button>
                </div>
                <section style={{ display : "flex", justifyContent: "space-between" }}>
                  <div>
                    <div>
                      <img src={`/api/portrait?name=${encodeURIComponent(currentHero.name)}`} loading="lazy" alt="" height={120} width={120} style={{ margin: "auto" }} />
                    </div>
                    <p aria-label="Hero name">{currentHero.name}</p>
                    <p>{currentHero.weaponColor} {currentHero.weaponType} {currentHero.movementType}</p>
                  </div>
                  <div>
                    <div className={styles.MovesetSlot}>
                      <Label.Root>
                        Weapon
                      </Label.Root>
                      <input defaultValue={heroDetailsForm.watch("weapon")} disabled />
                    </div>
                    <div className={styles.MovesetSlot}>
                      <Label.Root>
                        Assist
                      </Label.Root>
                      <input defaultValue={heroDetailsForm.watch("assist")} disabled />
                    </div>
                    <div className={styles.MovesetSlot}>
                      <Label.Root>
                        Special
                      </Label.Root>
                      <input defaultValue={heroDetailsForm.watch("special")} disabled />
                    </div>
                    <div className={styles.MovesetSlot}>
                      <Label.Root>
                        A
                      </Label.Root>
                      <input defaultValue={heroDetailsForm.watch("passivea")} disabled />
                    </div>
                    <div className={styles.MovesetSlot}>
                      <Label.Root>
                        B
                      </Label.Root>
                      <input defaultValue={heroDetailsForm.watch("passiveb")} disabled />
                    </div>
                    <div className={styles.MovesetSlot}>
                      <Label.Root>
                        C
                      </Label.Root>
                      <input defaultValue={heroDetailsForm.watch("passivec")} disabled />
                    </div>
                  </div>
                </section>
                <div>
                  <h2>Skills</h2>
                  <h4>Weapons</h4>
                  <Controller control={heroDetailsForm.control} name="weapon" render={({ field }) => {
                    return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.weapon} />
                  }} />
                  
                  <h4>Assists</h4>
                  <Controller control={heroDetailsForm.control} name="assist" render={({ field }) => {
                    return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.assist} />
                  }} />
                  <h4>Specials</h4>
                  <Controller control={heroDetailsForm.control} name="special" render={({ field }) => {
                    return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.special} />
                  }} />
                  <h4>A Passives</h4>
                  <Controller control={heroDetailsForm.control} name="passivea" render={({ field }) => {
                    return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.passivea} />
                  }} />
                  <h4>B Passives</h4>
                  <Controller control={heroDetailsForm.control} name="passiveb" render={({ field }) => {
                    return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.passiveb} />
                  }} />

                  <h4>C Passives</h4>
                  <Controller control={heroDetailsForm.control} name="passivec" render={({ field }) => {
                    return <SkillScroller value={field.value} onValueChange={field.onChange} data={skillsList.passivec} />
                  }} />

                  <Button style={{
                    transition: "background-color color",
                    transitionDuration: "200ms"
                  }} disabled={!heroDetailsForm.formState.isDirty}type="submit">Submit</Button>
                </div>
                <div>
                  <fieldset>
                    <legend>Details</legend>
                    <ul aria-atomic aria-label='Detailed options' aria-live="polite">
                      <li><label htmlFor="merges-count">Merges</label> <input id="merges-count" type="number" aria-valuemin={0} aria-valuemax={10} max={10} step={1} min={0} /></li>
                      <li><label htmlFor='resplendence'>Resplendent</label> <input type="checkbox" id="resplendence" /></li>
                      <li><label htmlFor='boon-selection'>Boon</label><select lang="en" id="boon-selection"><option></option><option>HP</option><option>Atk</option><option>Spd</option><option>Def</option><option>Res</option></select> <label htmlFor='bane-selection'>Bane</label> <select id="bane-selection"><option></option><option>HP</option><option>Atk</option><option>Spd</option><option>Def</option><option>Res</option></select></li>
                      <li><label htmlFor='summoner-support'>Summoner Support</label></li>
                    </ul>
                  </fieldset>
                </div>
              </form>
            </div>
        </TabsContent>
    );
};

export default FormTab;
