import { Button, SelectItem, TabsContent } from "@radix-ui/themes";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as Label from "@radix-ui/react-label";
import * as Select from '@radix-ui/react-select';
import styles from "./form-tab.module.scss";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

function FormTab({ id, callback }: { id: string, callback: (details: Partial<HeroDetails>) => void}) {
    const [currentTab, setCurrentTab] = useState<"hero-list" | "hero-details">("hero-list");

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
    
    return (
        <TabsContent value={id}>
            <div style={{ display: currentTab !== "hero-list" ? "none" : "block" }}>
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
                    <button type="submit">Find Heroes</button>
                    </fieldset>
                </form>
                <div aria-relevant="all" aria-live="polite">
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
                    <tbody>
                    {heroesList.map((sv) => (
                        <tr key={sv.Name} onClick={() => {
                        setCurrentHero({
                            name: sv.Name,
                            movementType: sv.MoveType,
                            weaponType: sv.WeaponType,
                            weaponColor: sv.WeaponColor
                        });
                        setCurrentTab("hero-details");
                        }}>
                        <td style={{ display: "flex" }}>
                            <div style={{ flex: 0.5, display: "flex", justifyContent: "center" }}>
                            <img height={60} width={60} loading="lazy" src={`/api/portrait?name=${encodeURIComponent(sv.Name)}`} />
                            </div>
                            <p style={{ display: "block", flex: 1 }}>{sv.Name}</p>
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
                </table>
            </div>
            <div style={{ display: currentTab !== "hero-details" ? "none" : "block"}}>
                <div style={{ display: "flex" }}>
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
                  setCurrentTab("hero-list");
                }} variant="surface">
                  Go Back
                </Button>
              </div>
              <div>
                <div>
                  <img src={`/api/portrait?name=${encodeURIComponent(currentHero.name)}`} loading="lazy" alt="" height={120} width={120} style={{ margin: "auto", backgroundColor: "red" }} />
                </div>
                <p aria-label="Hero name">{currentHero.name}</p>
                <p>{currentHero.weaponColor} {currentHero.weaponType} {currentHero.movementType}</p>
              </div>
              <div>
                <h2>Skills</h2>
                <h4>Weapons</h4>
                <Select.Root>
                  <Select.Trigger inputMode="text">
                    <Button variant="solid">
                      Assists
                    </Button>
                  </Select.Trigger>
                  <Select.Content>
                    {skillsList.weapon.map((w) => {
                      return <Select.Item value={w.name} key={w.name}>{w.name}</Select.Item>
                    })}
                  </Select.Content>
                </Select.Root>
                <h4>Assists</h4>
                <Select.Root>
                  <Select.Trigger inputMode="text">
                    <Button variant="solid">
                      Assists
                    </Button>
                  </Select.Trigger>
                  <Select.Content onClick={console.log}>
                    {skillsList.assist.map((w) => {
                      return <Select.Item key={w.name} value={w.name}>{w.name}</Select.Item>
                    })}
                  </Select.Content>
                </Select.Root>
                <h4>A Passives</h4>
                <Select.Root>
                  <Select.Trigger>
                    <Button variant="solid">
                      A Passives
                    </Button>
                  </Select.Trigger>
                  <Select.Content>
                    {skillsList.passivea.map((w) => {
                      return <Select.Item key={w.name} value={w.name}>{w.name}</Select.Item>
                    })}
                  </Select.Content>
                </Select.Root>
                <h4>B Passives</h4>
                <Select.Root>
                  <Select.Trigger>
                    <Button variant="solid">
                      B Passives
                    </Button>
                  </Select.Trigger>
                  <Select.Content>
                    {skillsList.passiveb.map((w) => {
                      return <Select.Item key={w.name} value={w.name}>{w.name}</Select.Item>
                    })}
                  </Select.Content>
                </Select.Root>
                <h4>C Passives</h4>
                <Select.Root>
                  <Select.Trigger>
                    <Button variant="solid">
                      C Passives
                    </Button>
                  </Select.Trigger>
                  <Select.Content>
                    {skillsList.passivec.map((w) => {
                      return <Select.Item key={w.name} value={w.name}>{w.name}</Select.Item>
                    })}
                  </Select.Content>
                </Select.Root>
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
            </div>
            </div>
        </TabsContent>
    );
};

export default FormTab;
