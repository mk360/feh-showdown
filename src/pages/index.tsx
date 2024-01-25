import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css';
import styles2 from './index.module.scss';
import React, { useState } from 'react'
import { Button, Grid, Tabs, Theme } from '@radix-ui/themes';
import FormTab from '@/components/form-tab';
import shortid from "shortid";
import PreviewTab from '@/components/preview-tab';
import { useRouter } from 'next/router';

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
  const [teamTab, setTeamTab] = useState("team-1");
  const router = useRouter();

  const renderedTeam1 = team1.filter((i) => i.Name);
  const renderedTeam2 = team2.filter((i) => i.Name);

  async function createTeams() {
        const trimmedTeams = team1.concat(team2).map((i) => {
            const { Name, weapon, passivea, passiveb, passivec } = i;
            return {
                name: Name,
                weapon,
                passivea,
                passiveb,
                passivec
            };
        });

        const response = await fetch("/api/team", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(trimmedTeams)
        });

        const js = await response.text();
        router.push(`/play/${js}`);
    };

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
          <Tabs.Root onValueChange={setTeamTab}>
            <Tabs.List>
              <Tabs.Trigger style={{ backgroundColor: "rgba(0,0,255, 0.1)" }} value='team-1'>Team 1</Tabs.Trigger>
              <Tabs.Trigger style={{ backgroundColor: "rgba(255,0,0, 0.1)" }} value='team-2'>Team 2</Tabs.Trigger>
              <Tabs.Trigger value='preview'>Validate</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content hidden={teamTab !== "team-1"} forceMount value='team-1' style={{ backgroundColor: "rgba(0,0,255, 0.1)" }}>
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
            <Tabs.Content forceMount hidden={teamTab !== "team-2"} value='team-2' style={{ backgroundColor: "rgba(255,0,0,0.1)" }}>
              <Tabs.Root value={currentSecondTeamTab} onValueChange={setCurrentSecondTeamTab} className={styles2.TabList}>
                <Tabs.List onFocus={() => {
                }} style={{ display: "flex" }}>
                  {team2.map((i, j) => (
                    <Tabs.Trigger style={{ flex: 1 }} key={j} value={i.id!}>
                      Hero #{j + 1}
                    </Tabs.Trigger>
                  ))}
                  <Tabs.Trigger style={{ flex: 1 }} value="preview">
                    Team Preview
                  </Tabs.Trigger>
                </Tabs.List>
                {team2.map((member, i) => (
                  <FormTab currentId={currentSecondTeamTab} key={member.id} callback={(data) => {
                    const newData = { ...team2[i], ...data };
                    const copy = [...team2];
                    copy[i] = newData;
                    setTeam2(copy);
                  }} id={member.id!} />
                ))}
                <PreviewTab team={team2} />
              </Tabs.Root>
            </Tabs.Content>
            <Tabs.Content forceMount hidden={teamTab !== "preview"} value="preview">
            <Grid columns="2">
              <div style={{ backgroundColor: "rgba(0, 0, 255, 0.1)", padding: 6 }}>
                {!!renderedTeam1.length && (<><h3>
                    Team 1
                  </h3>
                  {renderedTeam1.map((member) => {
                    return <button onClick={() => {
                        // setTeamTab to hero
                    }} key={member.id} style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <div style={{ height: 100 }}>
                            <img src={`/api/portrait?name=${encodeURIComponent(member.Name!)}`} style={{ width: "100%", height: "100%" }} />
                        </div>
                        <p>{member.Name}</p>
                        {/* <table style={{ minWidth: 256 }}>
                            <tr><td>{member.weapon || "-"}</td><td>{!!member.passivea && <img style={{ height: 30, width: 30 }} src={`/api/img?name=${encodeURIComponent(member.passivea!)}`} />} {member.passivea}</td></tr>
                            <tr><td>{member.assist || "-"}</td><td>{!!member.passiveb && <img style={{ height: 30, width: 30 }} src={`/api/img?name=${encodeURIComponent(member.passiveb!)}`} />} {member.passiveb}</td></tr>
                            <tr><td>{member.special || "-"}</td><td>{!!member.passivec && <img style={{ height: 30, width: 30 }} src={`/api/img?name=${encodeURIComponent(member.passivec!)}`} />} {member.passivec}</td></tr>
                        </table> */}

                    </button>
                })}</>)}
              </div>
              <div style={{ backgroundColor: "rgba(255, 0, 0, 0.1)", padding: 6 }}>
                {!!renderedTeam2.length && (
                  <>
                    <h3>Team 2</h3>
                    {renderedTeam2.map((member) => {
                      return <button onClick={() => {}} key={member.id} style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <p>{member.Name}</p>
                        <div style={{ height: 100 }}>
                            <img src={`/api/portrait?name=${encodeURIComponent(member.Name!)}`} style={{ width: "100%", height: "100%" }} />
                        </div>
                      </button>
                    })}
                  </>
                )}
              </div>
            </Grid>
            <Button variant='solid' onClick={createTeams}>Submit</Button>
            </Tabs.Content>
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
