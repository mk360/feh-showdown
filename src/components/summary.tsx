import { getSkillUrl } from "../data/skill-icon-dex";
import { SkillList } from "../interfaces/moveset";

function Summary({ data, onSlotSelect }: { data: StoredHero, onSlotSelect(slot: keyof SkillList):void }) {
  return (
    <div class="summary-grid">
      <button onClick={() => {
        onSlotSelect("weapons")
      }}>
        <img class="game-asset" src="/teambuilder/weapon-icon.png" />
        {data?.weapon}
      </button>
      <button onClick={() => {
        onSlotSelect("assists")
      }}>
        <img class="game-asset" src="/teambuilder/assist-icon.png" />
        {data?.assist}
      </button>
      <button onClick={() => {
        onSlotSelect("specials")
      }}>
        <img class="game-asset" src="/teambuilder/special-icon.png" />
        {data?.special}
      </button>
      <button onClick={() => {
        onSlotSelect("A")
      }}>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.A
              ? getSkillUrl(data.A)
              : "/teambuilder/A.png"
          }
        />
        {data?.A}
      </button>
      <button onClick={() => {
        onSlotSelect("B")
      }}>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.B 
              ? getSkillUrl(data.B)
              : "/teambuilder/B.png"
          }
        />
        {data?.B}
      </button>
      <button onClick={() => {
        onSlotSelect("C")
      }}>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.C 
              ? getSkillUrl(data.C)
              : "/teambuilder/C.png"
          }
        />
        {data?.C}
      </button>
      <button onClick={() => {
        onSlotSelect("S")
      }}>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.S 
              ? getSkillUrl(data.S)
              : "/teambuilder/S.png"
          }
        />
        {data?.S}
      </button>
    </div>
  );
}

export default Summary;
