import { createContext } from "preact";
import { SetStateAction } from "preact/compat";
import { Dispatch, useMemo, useState } from "preact/hooks";

const TeamContext = createContext<{
  teamPreview: StoredHero[];
  setTeamPreview: Dispatch<SetStateAction<StoredHero[]>>;
  tab: number;
  setTab: Dispatch<SetStateAction<number>>;
}>(null);

export const TeamProvider = ({ children }) => {
  const [teamPreview, setTeamPreview] = useState<StoredHero[]>(
    Array.from<StoredHero>({ length: 4 }).fill({
      name: "",
      weapon: "",
      assist: "",
      special: "",
      passive_a: "",
      passive_b: "",
      passive_c: "",
      passive_s: "",
      stats: {
        hp: 0,
        atk: 0,
        spd: 0,
        def: 0,
        res: 0,
      },
      merges: 0,
    })
  );
  const [tab, setTab] = useState(0);

  return (
    <TeamContext.Provider value={{ teamPreview, setTeamPreview, tab, setTab }}>
      {children}
    </TeamContext.Provider>
  );
};

export default TeamContext;
