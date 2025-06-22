import { useContext } from "preact/hooks";
import TeamContext from "../team-context";
import { formatName } from "../utils/strings";
import MovementIcon from "./movement-icon";
import WeaponIcon from "./weapon-icon";
import STATS from "../stats";
import PlusIcon from "../icons/plus-icon";

function Navigation() {
  const { setTab, teamPreview, tab } = useContext(TeamContext);

  return (
    <nav style="display: block; margin-bottom: 1rem; border-radius: 1rem;">
      <ul>
        {[0, 1, 2, 3].map((index) => {
          return (
            <li key={index}>
              <NavButton
                current={tab}
                index={index}
                teamPreview={teamPreview}
                onClick={setTab}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavButton({
  index,
  onClick,
  current,
  teamPreview,
}: {
  current: number;
  index: number;
  onClick(index: number): void;
  teamPreview: StoredHero[];
}) {
  return (
    <button class={`tab${current === index ? " currentTab" : ""}`} onClick={() => onClick(index)}>
      {!!teamPreview[index]?.name ? (
        <>
          <img
            src={`/teambuilder/thumbnails/${formatName(
              teamPreview[index].name
            )}.webp`}
          />
          <div style="display: flex; flex-direction: column">
            <WeaponIcon
              type={STATS[teamPreview[index].name].weaponType}
              color={STATS[teamPreview[index].name].color}
            />
            <MovementIcon type={STATS[teamPreview[index].name].movementType} />
          </div>
        </>
      ) : (
          <PlusIcon/>
      )}
    </button>
  );
}

export default Navigation;
