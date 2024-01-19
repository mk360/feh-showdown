import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css';
import styles2 from './index.module.scss';
import React, { useState } from 'react'
import { Button, DropdownMenu, Select, Tabs, Theme } from '@radix-ui/themes';
import FormTab from '@/components/form-tab';
import shortid from "shortid";
import PreviewTab from '@/components/preview-tab';

const inter = Inter({ subsets: ['latin'] })

export default function Home({ ids }: { ids: string[] }) {
  const [team, setTeam] = useState<Partial<HeroDetails>[]>(ids.map((id) => ({
    id,
  })));
  const [currentTab, setCurrentTab] = useState("");

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
          <Tabs.Root value={currentTab} onValueChange={setCurrentTab} className={styles2.TabList}>
            <Tabs.List onFocus={() => {
            }} style={{ display: "flex" }}>
              {team.map((i, j) => (
                <Tabs.Trigger style={{ flex: 1 }} key={j} value={i.id!}>
                  Hero #{j + 1}
                </Tabs.Trigger>
              ))}
              <Tabs.Trigger style={{ flex: 1 }} value="preview">
                Team Preview
              </Tabs.Trigger>
            </Tabs.List>
            {team.map((member, i) => (
              <FormTab currentId={currentTab} key={member.id} callback={(data) => { 
                const newData = {...team[i], ...data};
                const copy = [...team];
                copy[i] = newData;
                setTeam(copy);
              }} id={member.id!} />
            ))}
            <PreviewTab team={team} />
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
