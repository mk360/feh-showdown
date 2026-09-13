import { useContext, useRef } from "preact/hooks";
import HomeIcon from "../icons/home";
import PlusIcon from "../icons/plus-icon";
import SaveIcon from "../icons/save";
import STATS from "../stats";
import TeamContext from "../team-context";
import { formatName } from "../utils/strings";
import MovementIcon from "./movement-icon";
import WeaponIcon from "./weapon-icon";

function Navigation() {
  const { setTab, teamPreview, tab } = useContext(TeamContext);
  return <></>;
}

export default Navigation;
