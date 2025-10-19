import { createContext } from "preact";
import { SetStateAction } from "preact/compat";
import { Dispatch, useEffect, useState } from "preact/hooks";
import { getExtraStats, getLevel40Stats, withMerges } from "./stats/convert-to-level-40";
import EMPTY_CHARACTER from "./utils/empty-character-slot";

const TeamContext = createContext<{
  teamPreview: StoredHero[];
  setTeamPreview: Dispatch<SetStateAction<StoredHero[]>>;
  tab: number;
  errors: { [k: string]: string[] };
  setErrors: Dispatch<SetStateAction<{ [k: string]: string[] }>>;
  setTab: Dispatch<SetStateAction<number>>;
}>(null);

export const TeamProvider = ({ children }) => {
  const [teamPreview, setTeamPreview] = useState<StoredHero[]>(
    Array.from<StoredHero>({ length: 4 }).fill(EMPTY_CHARACTER)
  );
  const [errors, setErrors] = useState<{ [k:string]: string[] }>({});
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("team")) {
      const parsedTeam = JSON.parse(localStorage.getItem("team")) as StoredHero[];
      for (let i = 0; i < parsedTeam.length; i++) {
        const member = parsedTeam[i];
        const lv40 = getLevel40Stats({
          character: member.name,
          asset: member.asset,
          flaw: member.flaw,
        });
        const withMergesStats = withMerges(lv40, member.merges, member.asset, member.flaw);
        const extraStats = getExtraStats(member);

        const totalStats = {...withMergesStats};
        for (let key in extraStats) {
          totalStats[key] += extraStats[key];
        }

        member.stats = totalStats;

        parsedTeam[i] = member;
      }
      for (let i = parsedTeam.length; i < 4; i++) {
        parsedTeam.push(EMPTY_CHARACTER);
      }
      setTeamPreview(parsedTeam);
    }
  }, []);

  return (
    <TeamContext.Provider value={{ teamPreview, setTeamPreview, tab, setTab, errors, setErrors }}>
      {children}
    </TeamContext.Provider>
  );
};

export default TeamContext;
