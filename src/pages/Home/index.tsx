import Navigation from "../../components/navigation";
import Tab from "../../components/Tab";
import { TeamProvider } from "../../team-context";
import "./style.css";

export default function Teambuilder() {
  return (
    <TeamProvider>
      <Navigation />
      <Tab index={0} />
      <Tab index={1} />
      <Tab index={2} />
      <Tab index={3} />
    </TeamProvider>
  );
}
