import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css';
import styles2 from './index.module.scss';
import React, { useState } from 'react'
import { Tabs, Theme } from '@radix-ui/themes';
import FormTab from '@/components/form-tab';
import shortid from "shortid";
import PreviewTab from '@/components/preview-tab';

const inter = Inter({ subsets: ['latin'] })

export default function Home({ ids }: { ids: string[] }) {
  const [team1, setTeam1] = useState<Partial<HeroDetails & RawHeroIdentity>[]>(ids.slice(0, 4).map((id) => ({
    id,
  })));
  const [team2, setTeam2] = useState<Partial<HeroDetails & RawHeroIdentity>[]>(ids.slice(4).map((id) => ({
    id
  })));
  const [currentFirstTeamTab, setCurrentFirstTeamTab] = useState("");
  const [currentSecondTeamTab, setCurrentSecondTeamTab] = useState("");
  const [teamTab, setTeamTab] = useState<"team-1" | "team-2" | "preview">("team-1");

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
          <Tabs.Root>
            <Tabs.List>
              <Tabs.Trigger style={{ backgroundColor: "rgba(0,0,255, 0.1)" }} value='team-1'>Team 1</Tabs.Trigger>
              <Tabs.Trigger style={{ backgroundColor: "rgba(255,0,0, 0.1)" }} value='team-2'>Team 2</Tabs.Trigger>
              <Tabs.Trigger value='team-3'>Validate</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content hidden forceMount value='team-1' style={{ backgroundColor: "rgba(0,0,255, 0.1)" }}>
              <Tabs.Root value={currentFirstTeamTab} onValueChange={setCurrentFirstTeamTab} className={styles2.TabList}>
                <Tabs.List onFocus={() => {
                }} style={{ display: "flex" }}>
                  {team1.map((i, j) => (
                    <Tabs.Trigger style={{ flex: 1 }} key={j} value={i.id!}>
                      Hero #{j + 1}
                    </Tabs.Trigger>
                  ))}
                  <Tabs.Trigger style={{ flex: 1 }} value="preview">
                    Team Preview
                  </Tabs.Trigger>
                </Tabs.List>
                {team1.map((member, i) => (
                  <FormTab currentId={currentFirstTeamTab} key={member.id} callback={(data) => {
                    const newData = { ...team1[i], ...data };
                    const copy = [...team1];
                    copy[i] = newData;
                    setTeam1(copy);
                  }} id={member.id!} />
                ))}
                <PreviewTab team={team1} />
              </Tabs.Root>
            </Tabs.Content>
            <Tabs.Content forceMount value='team-2' style={{ backgroundColor: "rgba(255,0,0,0.1)" }}>
              <Tabs.Root value={currentFirstTeamTab} onValueChange={setCurrentFirstTeamTab} className={styles2.TabList}>
                <Tabs.List onFocus={() => {
                }} style={{ display: "flex" }}>
                  {team1.map((i, j) => (
                    <Tabs.Trigger style={{ flex: 1 }} key={j} value={i.id!}>
                      Hero #{j + 1}
                    </Tabs.Trigger>
                  ))}
                  <Tabs.Trigger style={{ flex: 1 }} value="preview">
                    Team Preview
                  </Tabs.Trigger>
                </Tabs.List>
                {team1.map((member, i) => (
                  <FormTab currentId={currentFirstTeamTab} key={member.id} callback={(data) => {
                    const newData = { ...team1[i], ...data };
                    const copy = [...team1];
                    copy[i] = newData;
                    setTeam1(copy);
                  }} id={member.id!} />
                ))}
                <PreviewTab team={team1} />
              </Tabs.Root>
            </Tabs.Content>
            <div className={styles2.startupMessage}>
              Greetings, Professors! Please select a Hero to begin!
            </div>
          </Tabs.Root>

        </Theme>
      </main>
    </>
  )
}

export async function getServerSideProps() {
  return {
    props: {
      ids: Array.from({ length: 8 }).map(() => shortid())
    }
  };
};
