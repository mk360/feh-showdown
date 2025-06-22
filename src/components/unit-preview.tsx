import { formatName } from "../utils/strings";
import SKILL_ICON_DEX, { getSkillUrl } from "../data/skill-icon-dex";

function UnitPreview({ data }: { data: StoredHero }) {
  return (
    <div class="unit-preview">
      {!!data?.name && (
        <img
          class="banner"
          src={`/teambuilder/banners/${formatName(data?.name)}.webp`}
        />
      )}
      <div class="unit-grid">
        <div class="name">{data?.name}</div>
        <div class="stat-grid">
          {!!data?.stats?.atk && (
            <table>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ textAlign: "end" }}>
                    HP
                  </td>
                  <td class={data.asset === "hp" ? "asset-stat" : data.flaw === "hp" ? "flaw-stat" : ""} colSpan={2} style={{ textAlign: "start" }}>
                    {data?.stats.hp}
                  </td>
                </tr>
                <tr>
                  <td>Atk</td>
                  <td class={data.asset === "atk" ? "asset-stat" : data.flaw === "atk" ? "flaw-stat" : ""}>{data?.stats.atk}</td>
                  <td>Spd</td>
                  <td class={data.asset === "spd" ? "asset-stat" : data.flaw === "spd" ? "flaw-stat" : ""}>{data?.stats.spd}</td>
                </tr>
                <tr>
                  <td>Def</td>
                  <td class={data.asset === "def" ? "asset-stat" : data.flaw === "def" ? "flaw-stat" : ""}>{data?.stats.def}</td>
                  <td>Res</td>
                  <td class={data.asset === "res" ? "asset-stat" : data.flaw === "res" ? "flaw-stat" : ""}>{data?.stats.res}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        <div class="passives-and-seals">
          <span>
            {!!data?.name &&
              `Lv. 40${
                data?.merges !== 0 ? `+${data?.merges}` : ""
              }`}
          </span>
          <div>
            {!!data?.passive_a && data?.passive_a !== "No A" ? (
              <img
                loading="lazy"
                title={data?.passive_a}
                class="game-asset"
                src={getSkillUrl(data.passive_a)}
              />
            ) : (
              <img
                loading="lazy"
                title={data?.passive_b}
                class="game-asset"
                src="/teambuilder/no-skill.png"
              />
            )}
            {!!data?.passive_b && data?.passive_b !== "No B" ? (
              <img
                title={data?.passive_b}
                loading="lazy"
                class="game-asset"
                src={getSkillUrl(data.passive_b)}
              />
            ) : (
              <img
                loading="lazy"
                title={data?.passive_b}
                class="game-asset"
                src="/teambuilder/no-skill.png"
              />
            )}
            {!!data?.passive_c && data?.passive_c !== "No C" ? (
              <img
                title={data?.passive_c}
                loading="lazy"
                class="game-asset"
                src={getSkillUrl(data.passive_c)}
              />
            ) : (
              <img
                loading="lazy"
                title={data?.passive_c}
                class="game-asset"
                src="/teambuilder/no-skill.png"
              />
            )}
            {!!data?.passive_s && data?.passive_s !== "No S" ? (
              <img
                title={data?.passive_s}
                loading="lazy"
                class="game-asset"
                src={getSkillUrl(data.passive_s)}
              />
            ) : (
              <img
                loading="lazy"
                title={data?.passive_s}
                class="game-asset"
                src="/teambuilder/no-skill.png"
              />
            )}
          </div>
        </div>
        <div class="main-skills">
          <div>
            <img src="/teambuilder/weapon-icon.png" />
            {data?.weapon}
          </div>
          <div>
            <img src="/teambuilder/assist-icon.png" />
            {data?.assist}
          </div>
          <div>
            <img src="/teambuilder/special-icon.png" />
            {data?.special}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnitPreview;
