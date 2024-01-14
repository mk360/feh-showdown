import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css';
import React, { useEffect, useState } from 'react'
import { Form, useForm } from 'react-hook-form'
import { Button, DropdownMenu, Select, Tabs, Theme } from '@radix-ui/themes';
import FormTab from '@/components/form-tab';
import shortid from "shortid";

const inter = Inter({ subsets: ['latin'] })

export default function Home({ ids }: { ids: string[] }) {
  const { register, handleSubmit, reset } = useForm<{
    name: string;
    boon: "atk" | "def" | "res" | "spd" | "hp";
    bane: "atk" | "def" | "res" | "spd" | "hp";
    color: "red" | "blue" | "green" | "colorless";
    movement: string;
    weaponType: string;
  }>({
    mode: "onSubmit"
  });
  const [team, setTeam] = useState<Partial<HeroDetails>[]>(ids.map((_, j) => ({
    id: ids[j]
  })));
  const [currentHero, setCurrentHero] = useState({
    name: "",
    movementType: "",
    weaponType: "",
    weaponColor: "",
  });
  const [heroesList, setHeroesList] = useState<any[]>([]);
  const [skillsList, setSkillsList] = useState({
    weapon: [] as { name: string; description: string }[],
    assist: [] as { name: string; description: string }[],
    special: [] as { name: string; description: string }[],
    passivea: [] as { name: string; description: string }[],
    passiveb: [] as { name: string; description: string }[],
    passivec: [] as { name: string; description: string }[]
  });

  const heroDetailsForm = useForm<{
    resplendent: boolean;
    merges: number;
    rarity: number;
  }>();

  const [currentTab, setCurrentTab] = useState<"hero-list" | "hero-details">("hero-list");

  const [currentSubpanel, setCurrentSubpanel] = useState<"details" | "weapon" | "a-skill" | "b-skill" | "c-skill" | "sacred seal">("details");

  useEffect(() => {
    if (currentHero.name) {
      fetch(`/api/skills?name=${encodeURIComponent(currentHero.name)}&movementType=${currentHero.movementType}&weaponType=${currentHero.weaponType}&weaponColor=${currentHero.weaponColor}`).then((res) => {
        res.json().then((resp) => {
          setSkillsList(resp);
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
        <style dangerouslySetInnerHTML={{ __html: "button { width: 100% } " }} />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <Theme>
          <nav style={{ width: "100%" }}>
            <Tabs.Root>
              <Tabs.List style={{ display: "flex" }}>
                {team.map((i, j) => (
                  <Tabs.Trigger style={{ flex: 1 }} key={j} value={i.id!}>
                    {i.name || `Hero #${j + 1}`}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              {team.map((member) => (
                <FormTab key={member.id} callback={() => { }} id={member.id!} />
              ))}
            </Tabs.Root>
          </nav>
          <div style={{ display: currentTab !== "hero-list" ? "none" : "block" }}>
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
                  <dd>
                    <select {...register("movement")} id="movement-selector" aria-labelledby='hero-movement'>
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

          <div style={{ display: currentTab !== "hero-details" ? "none" : "block" }}>
            
          </div>
        </Theme>
      </main>
    </>
  )
}

export async function getServerSideProps() {
  return {
    props: {
      ids: Array.from({ length: 4 }).map(() => shortid())
    }
  };
};
