import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css';
import styles2 from './index.module.scss';
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
          <Tabs.Root className={styles2.TabList}>
            <Tabs.List onFocus={() => {
            }} style={{ display: "flex" }}>
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
          <div className={styles2.startupMessage}>
            Greetings, Professors! Please select a Hero to begin!
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
