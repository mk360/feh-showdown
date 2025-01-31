import { useCallback, useMemo, useState } from "preact/hooks";
import "./style.css";
import Tab from "../../components/Tab";

export default function Teambuilder() {
  const [team, setTeam] = useState<StoredHero[]>(
    Array.from<null>({ length: 4 }).fill(null)
  );
  const [currentTab, setCurrentTab] = useState(1);
  const updateTeam = useCallback((savedHero: StoredHero, index: number) => {
    const clonedTeam = [...team];
    clonedTeam[index] = savedHero;
    setTeam(clonedTeam);
  }, []);

  return (
    <>
      <nav style="display: block">
        <ul>
          <li>
            <button
              class="tab"
              onClick={() => {
                setCurrentTab(1);
              }}
            >
              Teammate 1
            </button>
          </li>
          <li>
            <button
              class="tab"
              onClick={() => {
                setCurrentTab(2);
              }}
            >
              Teammate 2
            </button>
          </li>
          <li>
            <button
              class="tab"
              onClick={() => {
                setCurrentTab(3);
              }}
            >
              Teammate 3
            </button>
          </li>
          <li>
            <button
              class="tab"
              onClick={() => {
                setCurrentTab(4);
              }}
            >
              Teammate 4
            </button>
          </li>
        </ul>
      </nav>
      <section class={currentTab !== 1 ? "hide" : ""} id="tab-content-1">
        <Tab
          data={team[0]}
          onSave={(savedHero) => {
            updateTeam(savedHero, 0);
          }}
        />
      </section>
      <section class={currentTab !== 2 ? "hide" : ""} id="tab-content-2">
        <Tab
          data={team[1]}
          onSave={(savedHero) => {
            updateTeam(savedHero, 1);
          }}
        />
      </section>
      <section class={currentTab !== 3 ? "hide" : ""} id="tab-content-3">
        <Tab
          data={team[2]}
          onSave={(savedHero) => {
            updateTeam(savedHero, 0);
          }}
        />
      </section>
      <section class={currentTab !== 4 ? "hide" : ""} id="tab-content-4">
        <Tab
          data={team[3]}
          onSave={(savedHero) => {
            updateTeam(savedHero, 1);
          }}
        />
      </section>
    </>
  );
}
