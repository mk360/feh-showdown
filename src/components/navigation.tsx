import { useContext } from "preact/hooks";
import TeamContext from "../team-context";
import { formatName } from "../utils/strings";
import MovementIcon from "./movement-icon";
import WeaponIcon from "./weapon-icon";

function Navigation() {
  const { setTab, teamPreview } = useContext(TeamContext);

  return (
    <nav style="display: block">
      <ul>
        {[0, 1, 2, 3].map((index) => {
          return (
            <li key={index}>
              <NavButton
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
  teamPreview,
}: {
  index: number;
  onClick(index: number): void;
  teamPreview: StoredHero[];
}) {
  return (
    <button class="tab" onClick={() => onClick(index)}>
      {!!teamPreview[index].name ? (
        <>
          <img
            src={`/thumbnails/${formatName(teamPreview[index].name)}.webp`}
          />
          <div>
            <WeaponIcon
              type={STATS[teamPreview[index].name].weaponType}
              color={STATS[teamPreview[index].name].color}
            />
            <MovementIcon type={STATS[teamPreview[index].name].movementType} />
          </div>
        </>
      ) : (
        `Teammate ${index + 1}`
      )}
    </button>
  );
}

export default Navigation;
