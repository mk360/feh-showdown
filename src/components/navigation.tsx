import { useContext } from "preact/hooks";
import TeamContext from "../team-context";

function Navigation() {
  const { setTab } = useContext(TeamContext);

  return (
    <nav style="display: block">
      <ul>
        <li>
          <button
            class="tab"
            onClick={() => {
              setTab(0);
            }}
          >
            Teammate 1
          </button>
        </li>
        <li>
          <button
            class="tab"
            onClick={() => {
              setTab(1);
            }}
          >
            Teammate 2
          </button>
        </li>
        <li>
          <button
            class="tab"
            onClick={() => {
              setTab(2);
            }}
          >
            Teammate 3
          </button>
        </li>
        <li>
          <button
            class="tab"
            onClick={() => {
              setTab(3);
            }}
          >
            Teammate 4
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
