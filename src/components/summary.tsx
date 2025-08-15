import { getSkillUrl } from "../data/skill-icon-dex";

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
            data?.A
              ? getSkillUrl(data.A)
              : "/teambuilder/A.png"
          }
        />
      </div>
      <div>{data?.A}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.B 
              ? getSkillUrl(data.B)
              : "/teambuilder/B.png"
          }
        />
      </div>
      <div>{data?.B}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.C 
              ? getSkillUrl(data.C)
              : "/teambuilder/C.png"
          }
        />
      </div>
      <div>{data?.C}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.S 
              ? getSkillUrl(data.S)
              : "/teambuilder/S.png"
          }
        />
      </div>
      <div>{data?.S}</div>
    </div>
  );
}

export default Summary;
