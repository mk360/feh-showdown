import { getSkillUrl } from "../data/skill-icon-dex";
import { formatName } from "../utils/strings";

function EmptyIcon({ title }: { title: string }) {
  return <img
    loading="lazy"
    title={title}
    class="game-asset"
    src="/teambuilder/no-skill.png"
  />;
}

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
            {!!data?.A && data?.A !== "No A" ? (
              <img
                loading="lazy"
                title={data?.A}
                class="game-asset"
                src={getSkillUrl(data.A)}
              />
            ) : (
              <EmptyIcon title="No A Passive" />
            )}
            {!!data?.B && data?.B !== "No B" ? (
              <img
                title={data?.B}
                loading="lazy"
                class="game-asset"
                src={getSkillUrl(data.B)}
              />
            ) : (
              <EmptyIcon title="No B Passive" />
            )}
            {!!data?.C && data?.C !== "No C" ? (
              <img
                title={data?.C}
                loading="lazy"
                class="game-asset"
                src={getSkillUrl(data.C)}
              />
            ) : (
              <EmptyIcon title="No C Passive" />
            )}
            {!!data?.S && data?.S !== "No S" ? (
              <img
                title={data?.S}
                loading="lazy"
                class="game-asset"
                src={getSkillUrl(data.S)}
              />
            ) : (
              <EmptyIcon title="No Sacred Seal" />
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
