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
import io, { Socket } from "socket.io-client";

const inter = Inter({ subsets: ['latin'] })

export default function Home({ ids }: { ids: string[] }) {
  const [team1, setTeam1] = useState<Partial<HeroDetails & RawHeroIdentity>[]>(ids.slice(0, 4).map((id) => ({
    id,
  })));
  const [team2, setTeam2] = useState<Partial<HeroDetails & RawHeroIdentity>[]>(ids.slice(4).map((id) => ({
    id
  })));
  const [socket, setSocket] = useState<Socket>();
  const [currentFirstTeamTab, setCurrentFirstTeamTab] = useState("");
  const [currentSecondTeamTab, setCurrentSecondTeamTab] = useState("");
  const [teamTab, setTeamTab] = useState("team-1");
  const router = useRouter();

  const renderedTeam1 = team1.filter((i) => i.Name);
  const renderedTeam2 = team2.filter((i) => i.Name);

  async function createTeams() {
    const trimmedTeam1 = team1.map((i) => {
      const { Name, weapon, passivea, passiveb, passivec } = i;
      return {
        name: Name,
        weapon,
        passivea,
        passiveb,
        passivec
      };
    });

    const trimmedTeam2 = team2.map((i) => {
      const { Name, weapon, passivea, passiveb, passivec } = i;
      return {
        name: Name,
        weapon,
        passivea,
        passiveb,
        passivec
      };
    });

    const response = await fetch("http://localhost:3600/team", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        team1: trimmedTeam1,
        team2: trimmedTeam2,
      })
    });
    //

    const js = await response.text();
    if (response.ok && response.status === 200) router.push(`/play/${js}`);
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
        <Theme accentColor="amber">
          <Tabs.Root onValueChange={setTeamTab}>
            <Tabs.List>
              <Tabs.Trigger style={{ backgroundColor: "rgba(0,0,255, 0.1)" }} value='team-1'>Team 1</Tabs.Trigger>
              <Tabs.Trigger style={{ backgroundColor: "rgba(255,0,0, 0.1)" }} value='team-2'>Team 2</Tabs.Trigger>
              <Tabs.Trigger style={{ background: "rgba(0, 255, 0, 0.1)" }} value='preview'>Battle Preview</Tabs.Trigger>
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
            <Tabs.Content forceMount hidden={teamTab !== "preview" || !renderedTeam1.concat(renderedTeam2).length} value="preview">
              <Grid columns="2">
                <div style={{ backgroundColor: "rgba(0, 0, 255, 0.1)", paddingRight: 10, paddingLeft: 10, paddingBottom: 10, display: "flex", gap: 10, flexDirection: "column" }}>
                  {!!renderedTeam1.length && (<><h3 style={{ textAlign: "end" }}>
                    Team 1
                  </h3>
                    {renderedTeam1.map((member) => {
                      return <button onClick={() => {
                        setCurrentFirstTeamTab(member.id!);
                        setTeamTab("team1");
                      }} key={member.id} style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <div style={{ height: 100 }}>
                          <img src={`/api/portrait?name=${encodeURIComponent(member.Name!)}`} style={{ width: "100%", height: "100%" }} />
                        </div>
                        <p>{member.Name}</p>
                      </button>
                    })}</>)}
                </div>
                <div style={{ backgroundColor: "rgba(255, 0, 0, 0.1)", paddingRight: 10, paddingLeft: 10, display: "flex", gap: 10, flexDirection: "column" }}>
                  {!!renderedTeam2.length && (
                    <>
                      <h3>Team 2</h3>
                      {renderedTeam2.map((member) => {
                        return <button onClick={() => {
                          setCurrentSecondTeamTab(member.id!);
                          setTeamTab("team-2");
                        }} key={member.id} style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
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
              <Button variant='solid' style={{ marginTop: 10 }} onClick={createTeams}>Start Battle!</Button>
            </Tabs.Content>
          </Tabs.Root>
          <Button onClick={() => {
            setTeam1([{
              id: team1[0].id,
              Name: "Roy: Brave Lion",
              weapon: "Durandal",
              special: "Galeforce",
              passivea: "Steady Blow 2",
              passiveb: "Desperation 3",
            }, {
              id: team1[1].id,
              Name: "Lyn: Brave Lady",
              weapon: "Mulagir",
              special: "Draconic Aura",
              passivea: "Swift Sparrow 2",
              passiveb: "Sacae's Blessing",
              passivec: "Atk Smoke 3"
            }, {
              id: team1[2].id,
              Name: "Ike: Brave Mercenary",
              weapon: "Silver Axe+",
              special: "Aether",
              passiveb: "Beorc's Blessing"
            }, {
              id: team1[3].id,
              Name: "Lucina: Brave Princess",
              weapon: "Geirskögul",
              special: "Aether",
              passivea: "Sturdy Blow 2",
              passivec: "Drive Spd 2"
            }]);
            setTeam2([{
              id: team2[0].id,
              Name: "Hector: General of Ostia",
              weapon: "Armads",
              special: "Pavise",
              passivea: "Distant Counter",
              passiveb: "Goad Armor",
            }, {
              id: team2[1].id,
              Name: "Chrom: Exalted Prince",
              weapon: "Silver Sword+",
              special: "Aether",
              passivea: "Defiant Def 3",
              passivec: "Spur Def 3"
            }, {
              id: team2[2].id,
              Name: "Ike: Brave Mercenary",
              weapon: "Silver Axe+",
              special: "Aether",
              passiveb: "Beorc's Blessing"
            }, {
              id: team2[3].id,
              Name: "Lucina: Brave Princess",
              weapon: "Geirskögul",
              special: "Aether",
              passivea: "Sturdy Blow 2",
              passivec: "Drive Spd 2"
            }])
          }} variant="surface">Fill Debug Data</Button>
          {/* <Button onClick={testSocket} variant="classic">
            Test Socket
          </Button> */}
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
