import SKILL_ICON_DEX, { getSkillUrl } from "../data/skill-icon-dex";

function Summary({ data }: { data: StoredHero }) {
  return (
    <div class="summary-grid">
      <div>
        <img class="game-asset" src="/teambuilder/weapon-icon.png" />
      </div>
      <div>{data?.weapon}</div>
      <div>
        <img class="game-asset" src="/teambuilder/assist-icon.png" />
      </div>
      <div>{data?.assist}</div>
      <div>
        <img class="game-asset" src="/teambuilder/special-icon.png" />
      </div>
      <div>{data?.special}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.passive_a
              ? getSkillUrl(data.passive_a)
              : "/teambuilder/A.png"
          }
        />
      </div>
      <div>{data?.passive_a}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.passive_b 
              ? getSkillUrl(data.passive_b)
              : "/teambuilder/B.png"
          }
        />
      </div>
      <div>{data?.passive_b}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.passive_c 
              ? getSkillUrl(data.passive_c)
              : "/teambuilder/C.png"
          }
        />
      </div>
      <div>{data?.passive_c}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.sacred_seal 
              ? getSkillUrl(data.sacred_seal)
              : "/teambuilder/S.png"
          }
        />
      </div>
      <div>{data?.sacred_seal}</div>
    </div>
  );
}

export default Summary;
