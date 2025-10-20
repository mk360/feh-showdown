import { useContext } from "preact/hooks";
import TeamContext from "../team-context";
import UnitPreview from "./unit-preview";

function TeamPreview() {
  const { teamPreview } = useContext(TeamContext);
  return teamPreview.map((preview, index) => {
    return <UnitPreview data={preview} />;
  });
}

export default TeamPreview;
