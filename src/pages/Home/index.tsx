import Navigation from "../../components/navigation";
import Tab from "../../components/Tab";
import { TeamProvider } from "../../team-context";
import "./style.css";

export default function Teambuilder() {
  return (
    <TeamProvider>
      <Navigation />
      <Tab />
    </TeamProvider>
  );
}
