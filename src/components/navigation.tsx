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
  const lastAbortController = useRef(new AbortController());

  return (<div style={{ display: "flex", justifyContent: "space-between", gap: "2rem", alignItems: "center", marginBottom: "1rem" }}>
          <button style={{ flex: 0.1, borderRadius: "1rem" }} class={"tab homepage"}>
             <a href={import.meta.env.VITE_MAIN_APP_URL} target="_top"><HomeIcon /></a>
          </button>
    <nav style="display: block; flex: 1;">
      <ul>
        {/* <li>
        </li> */}
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
        {/* <li>
        </li> */}
      </ul>
    </nav>
    <button style={{ flex: 0.1, borderRadius: "1rem" }} onClick={() => {
        lastAbortController.current.abort();
        lastAbortController.current = new AbortController();
        fetch(`${import.meta.env.VITE_API_URL}/team`, {
          method: "POST",
          headers: {
            "Authorization": localStorage.getItem("pid"),
            "Content-Type": "application/json"
          },
          signal: lastAbortController.current.signal,
          body: JSON.stringify(teamPreview.filter((i) => i.name).map((rec) => {
            const payload = {
              name: rec.name ?? "",
              weapon: rec.weapon ?? "",
              assist: rec.assist ?? "",
              special: rec.special ?? "",
              A: rec.A ?? "",
              B: rec.B ?? "",
              C: rec.C ?? "",
              S: rec.S ?? "",
              asset: rec.asset ?? "",
              flaw: rec.flaw ?? "",
              merges: rec.merges ?? 0,
            };

            return payload;
          }))
        }).then((resp) => {
          localStorage.setItem("team", JSON.stringify(teamPreview.filter((i) => i.name).map((rec) => {
          const payload = {
            name: rec.name ?? "",
            weapon: rec.weapon ?? "",
            assist: rec.assist ?? "",
            special: rec.special ?? "",
            A: rec.A ?? "",
            B: rec.B ?? "",
            C: rec.C ?? "",
            S: rec.S ?? "",
            asset: rec.asset ?? "",
            flaw: rec.flaw ?? "",
            merges: rec.merges ?? 0,
          };

          return payload;
        })));
          if (resp.ok) {
            return {};
          }
          return resp.json()
        }).then((errors) => {
          if (!Object.keys(errors).length) {
            alert("Your team is ready. You will be redirected to the main page.");
            location.href = "/";
          } else {
            let str = "";
            for (let key in errors) {
              str += errors[key].join(". ");
            }
            alert(str);
          }
        }).catch(() => {
          localStorage.setItem("team", JSON.stringify(teamPreview.filter((i) => i.name).map((rec) => {
          const payload = {
            name: rec.name ?? "",
            weapon: rec.weapon ?? "",
            assist: rec.assist ?? "",
            special: rec.special ?? "",
            A: rec.A ?? "",
            B: rec.B ?? "",
            C: rec.C ?? "",
            S: rec.S ?? "",
            asset: rec.asset ?? "",
            flaw: rec.flaw ?? "",
            merges: rec.merges ?? 0,
          };

          return payload;
        })));
          alert("An unknown error happened.");
        })
      }} class="tab save"><div style={{ display: "flex", justifyContent: "center"}}><SaveIcon /></div></button>
    </div>
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
