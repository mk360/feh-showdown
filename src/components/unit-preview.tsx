import { formatName } from "../utils/strings";

function UnitPreview(summary: { data: StoredHero }) {
  return (
    <div class="unit-preview">
      {!!summary.data?.name && (
        <img
          class="banner"
          src={`/banners/${formatName(summary.data?.name)}.webp`}
        />
      )}
      <div class="unit-grid">
        <div class="name">{summary.data?.name}</div>
        <div class="stat-grid">
          {!!summary.data?.stats.atk && (
            <table>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ textAlign: "end" }}>
                    HP
                  </td>
                  <td colSpan={2} style={{ textAlign: "start" }}>
                    {summary.data?.stats.hp}
                  </td>
                </tr>
                <tr>
                  <td>Atk</td>
                  <td>{summary.data?.stats.atk}</td>
                  <td>Spd</td>
                  <td>{summary.data?.stats.spd}</td>
                </tr>
                <tr>
                  <td>Def</td>
                  <td>{summary.data?.stats.def}</td>
                  <td>Res</td>
                  <td>{summary.data?.stats.res}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        <div class="passives-and-seals">
          <span>
            {!!summary.data?.name &&
              `Lv. 40${
                summary.data?.merges !== 0 ? `+${summary.data?.merges}` : ""
              }`}
          </span>
          <div>
            {!!summary.data?.passive_a && summary.data?.passive_a !== "No A" ? (
              <img
                loading="lazy"
                title={summary.data?.passive_a}
                class="game-asset"
                src={`http://localhost:3479/img/${summary.data?.passive_a.replace(
                  "/",
                  ";"
                )}`}
              />
            ) : (
              <img
                loading="lazy"
                title={summary.data?.passive_b}
                class="game-asset"
                src="/no-skill.png"
              />
            )}
            {!!summary.data?.passive_b && summary.data?.passive_b !== "No B" ? (
              <img
                title={summary.data?.passive_b}
                loading="lazy"
                class="game-asset"
                src={`http://localhost:3479/img/${summary.data?.passive_b.replace(
                  "/",
                  ";"
                )}`}
              />
            ) : (
              <img
                loading="lazy"
                title={summary.data?.passive_b}
                class="game-asset"
                src="/no-skill.png"
              />
            )}
            {!!summary.data?.passive_c && summary.data?.passive_c !== "No C" ? (
              <img
                title={summary.data?.passive_c}
                loading="lazy"
                class="game-asset"
                src={`http://localhost:3479/img/${summary.data?.passive_c.replace(
                  "/",
                  ";"
                )}`}
              />
            ) : (
              <img
                loading="lazy"
                title={summary.data?.passive_c}
                class="game-asset"
                src="/no-skill.png"
              />
            )}
            {!!summary.data?.passive_s && summary.data?.passive_s !== "No S" ? (
              <img
                title={summary.data?.passive_s}
                loading="lazy"
                class="game-asset"
                src={`http://localhost:3479/img/${summary.data?.passive_s.replace(
                  "/",
                  ";"
                )}`}
              />
            ) : (
              <img
                loading="lazy"
                title={summary.data?.passive_b}
                class="game-asset"
                src="/no-skill.png"
              />
            )}
          </div>
        </div>
        <div class="main-skills">
          <div>
            <img src="/weapon-icon.png" />
            {summary.data?.weapon}
          </div>
          <div>
            <img src="/assist-icon.png" />
            {summary.data?.assist}
          </div>
          <div>
            <img src="/special-icon.png" />
            {summary.data?.special}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnitPreview;
