import { createContext } from "preact";
import { SetStateAction } from "preact/compat";
import { Dispatch, useState } from "preact/hooks";

const TeamContext = createContext<{
  teamPreview: StoredHero[];
  setTeamPreview: Dispatch<SetStateAction<StoredHero[]>>;
  tab: number;
  setTab: Dispatch<SetStateAction<number>>;
}>(null);

export const TeamProvider = ({ children }) => {
  const [teamPreview, setTeamPreview] = useState<StoredHero[]>([]);
  const [tab, setTab] = useState(0);

  return (
    <TeamContext.Provider value={{ teamPreview, setTeamPreview, tab, setTab }}>
      {children}
    </TeamContext.Provider>
  );
};

export default TeamContext;
