import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { register, handleSubmit } = useForm<{
    name: string;
    boon: "atk" | "def" | "res" | "spd" | "hp";
    bane: "atk" | "def" | "res" | "spd" | "hp";
    color: "red" | "blue" | "green" | "colorless";
    movement: string;
    weaponType: string;
  }>({
    mode: "onSubmit"
  });
  const [team, setTeam] = useState([]);
  const [currentHero, setCurrentHero] = useState("");
  const [heroesList, setHeroesList] = useState<any[]>([]);
  const [skillsList, setSkillsList] = useState();

  const heroDetailsForm = useForm<{
    resplendent: boolean;
    merges: number;
    rarity: number;
  }>();

  const [currentTab, setCurrentTab] = useState<"hero" | "hero-details">("hero");

  const [currentSubpanel, setCurrentSubpanel] = useState<"details" | "weapon" | "a-skill" | "b-skill" | "c-skill" | "sacred seal">("details");

  useEffect(() => {
    if (currentHero) {
      fetch(`/api/skills?name=${encodeURIComponent(currentHero)}`).then((res) => {
        res.json().then((resp: CargoQuery<{ Name: string, Scategory: string, Description: string }>) => {
          console.log(resp);
        });
      });
    }
  }, [currentHero]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="FEH Showdown" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <style dangerouslySetInnerHTML={{ __html: "button { width: 100% } "}} />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <nav style={{ width: "100%" }}>
          <ul style={{ display: "flex", listStyleType: "none" }}>
            <li style={{ flex: 1 }}>
              <button style={{ width: "100%" }}>Chrom: Exalted Prince</button>
            </li>
            <li style={{ flex: 1 }}>
              <button style={{ width: "100%" }}>New Hero</button>
            </li>
          </ul>
        </nav>
        <div style={{ display: currentTab !== "hero" ? "none" : "block" }}>
          <form onSubmit={handleSubmit((heroesQuery) => {
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
                <dt><label id="name" htmlFor="name-input">Hero Name</label></dt>
                <dd><input id="name-input" autoComplete="off" aria-labelledby='name' {...register("name")} /></dd>
                <dt><label id="hero-color" htmlFor='color-selector'>
                  Hero Color
                </label></dt>
                <dd><select {...register("color")} aria-describedby='color-warning' id="color-selector" aria-labelledby='hero-color'>
                  <option></option>
                  <option>Red</option>
                  <option>Blue</option>
                  <option>Green</option>
                  <option>Colorless</option>
                </select></dd>
                <dt><label id="hero-weapon" htmlFor='weapon-selector'>
                  Hero Weapon
                </label></dt>
                <dd><select {...register("weaponType")} aria-describedby='hero-weapon' id="weapon-selector">
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
                <dd><select {...register("movement")} id="movement-selector" aria-labelledby='hero-movement'>
                  <option></option>
                  <option>Infantry</option>
                  <option>Armored</option>
                  <option>Flying</option>
                  <option>Cavalry</option>
                </select></dd>
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
                  setCurrentHero(sv.Name);
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

        <div style={{ display: currentTab !== "hero-details" ? "none" : "block" }}>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <div style={{ textAlign: "center" }}>
                <Image src="" loading="lazy" alt="" height={40} width={40} style={{ margin: "auto", backgroundColor: "red" }} />
              </div>
              <p style={{ textAlign: "center" }} aria-label="Hero name">{currentHero}</p>
            </div>
            <div style={{ flex: 1 }}>
              <h4 id="moveset-section-title">Moveset</h4>
              <dl>
                <dt><label htmlFor='weapon-slot'>Weapon</label></dt>
                <dd><input onFocus={() => {
                  setCurrentSubpanel("weapon");
                }} disabled id="weapon-slot" autoComplete='off' value="Sealed Falchion" /></dd>
                <dt><label htmlFor='passive-a'>A Passive</label></dt>
                <dd><input disabled id="passive-a" autoComplete='off' value="HP+5" /></dd>
                <dt><label htmlFor='passive-b'>B Passive</label></dt>
                <dd><input id="passive-b" autoComplete='off' value="Vantage 3" /></dd>
                <dt><label htmlFor='passive-c'>C Passive</label></dt>
                <dd><input disabled autoComplete='off' id="passive-c" value="Atk Smoke 3" /></dd>
                <dt><label htmlFor='sacred-seal'>Sacred Seal</label></dt>
                <dd><input disabled id="sacred-seal" autoComplete="off" value="Poison Strike 3" /></dd>
              </dl>
            </div>
            <div style={{ flex: 1 }}>
              <h4>Stats</h4>
              <table aria-label={`Stats for ${{ name: "bougnoule" }.name}`} aria-atomic aria-live="polite">
                <tbody>
                  <tr><td scope="row" style={{ textAlign: "right" }} colSpan={2}>HP</td><td colSpan={2}>59</td></tr>
                  <tr><td scope='row'>Atk</td><td>70</td><td scope="row">Def</td><td>46</td></tr>
                  <tr><td scope="row">Spd</td><td>37</td><td scope="row">Res</td><td>32</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <form style={{ display: currentSubpanel === "details" ? "block" : "none" }}>
              <fieldset>
                <legend>Level</legend>
                <div><label htmlFor='level-1'>Level 1</label> <input id="level-1" type="radio" name="level" value={1} /> <label htmlFor='level-40'>Level 40</label> <input type="radio" id="level-40" name="level" value={40} /></div>
              </fieldset>
              <ul aria-atomic aria-label='Detailed options' aria-live="polite">
                <li><label htmlFor="merges-count">Merges</label> <input id="merges-count" type="number" aria-valuemin={0} aria-valuemax={10} max={10} step={1} min={0} /></li>
                <li><label htmlFor='resplendence'>Resplendent</label> <input type="checkbox" id="resplendence" /></li>
                <li><label htmlFor='boon-selection'>Boon</label><select lang="en" id="boon-selection"><option></option><option>HP</option><option>Atk</option><option>Spd</option><option>Def</option><option>Res</option></select> <label htmlFor='bane-selection'>Bane</label> <select id="bane-selection"><option></option><option>HP</option><option>Atk</option><option>Spd</option><option>Def</option><option>Res</option></select></li>
                <li><label htmlFor='summoner-support'>Summoner Support</label></li>
              </ul>
            </form>
            <h2>Skills</h2>
            <h4>Weapons</h4>
            <div>
              {/* searchbox with list of results */}
            </div>
            <h4>A Passives</h4>
            <div>
              {/* searchbox with list of results */}
            </div>
            <h4>B Passives</h4>
            <div>
              {/* searchbox with list of results */}
            </div>
            <h4>C Passives</h4>
            <div>
              {/* searchbox with list of results */}
            </div>
            <h4>Sacred Seals</h4>
            <div>
              {/* searchbox with list of results */}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
