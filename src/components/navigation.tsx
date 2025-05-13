import { useContext } from "preact/hooks";
import TeamContext from "../team-context";
import { formatName } from "../utils/strings";
import MovementIcon from "./movement-icon";
import WeaponIcon from "./weapon-icon";
import STATS from "../stats";
import PlusIcon from "../icons/plus-icon";

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
  //[{"name":"Arvis: Emperor of Flame","weapon":"Valflame","assist":"Smite","special":"Aether","merges":10,"passive_a":"Atk/Res Bond 3","passive_b":"Axebreaker 3","passive_c":"Atk Ploy 3","passive_s":"Atk/Res Bond 3","stats":{"hp":37,"atk":52,"spd":35,"def":20,"res":40,"asset":"res","flaw":"def"}},{"name":"Effie: Army of One","weapon":"First Bite+","assist":"Reciprocal Aid","special":"Rising Flame","merges":10,"passive_a":"Atk/Def Bond 3","passive_b":"Bowbreaker 3","passive_c":"Panic Ploy 3","passive_s":"Attack/Res 2","stats":{"hp":57,"atk":60,"spd":25,"def":37,"res":29,"asset":"hp","flaw":"spd"}},{"name":"Ike: Brave Mercenary","weapon":"Urvan","assist":"Ardent Sacrifice","special":"Aether","merges":10,"passive_a":"Distant Counter","passive_b":"Beorc's Blessing","passive_c":"Breath of Life 3","passive_s":"Defiant Atk 3","stats":{"hp":47,"atk":59,"spd":31,"def":39,"res":24,"asset":"atk","flaw":"spd"}},{"name":"Felicia: Maid Mayhem","weapon":"Felicia's Plate","assist":"Harsh Command","special":"Astra","merges":10,"passive_a":"Attack +3","passive_b":"B Tomebreaker 3","passive_c":"Breath of Life 3","passive_s":"Flashing Blade 3","stats":{"hp":38,"atk":47,"spd":41,"def":21,"res":39,"asset":"atk","flaw":"def"}}]
  return (
    <button class="tab" onClick={() => onClick(index)}>
      {!!teamPreview[index].name ? (
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
        <>
          {/* <span class="">{index + 1}</span> */}
          <PlusIcon/>
        </>
      )}
    </button>
  );
}

export default Navigation;
