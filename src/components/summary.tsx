import { getSkillUrl } from "../data/skill-icon-dex";
import { SkillList } from "../interfaces/moveset";

interface SummaryProps {
  data: StoredHero;
  onSlotSelect(slot: keyof SkillList | ""): void;
  selectedSlot: keyof SkillList | "";
}

function Summary({ data, onSlotSelect, selectedSlot }: SummaryProps) {
  return (
    <div class="summary-grid">
      <button onClick={() => {
        if (selectedSlot === "weapons") {
          onSlotSelect("");
        } else {
          onSlotSelect("weapons")
        }
      }}>
        <img class="game-asset" src="/teambuilder/weapon-icon.png" />
        {data?.weapon || "None"}
      </button>
      <button onClick={() => {
         if (selectedSlot === "assists") {
          onSlotSelect("");
        } else {
          onSlotSelect("assists")
        }
      }}>
        <img class="game-asset" src="/teambuilder/assist-icon.png" />
        {data?.assist || "None"}
      </button>
      <button onClick={() => {
       if (selectedSlot === "specials") {
          onSlotSelect("");
        } else {
          onSlotSelect("specials")
        }
      }}>
        <img class="game-asset" src="/teambuilder/special-icon.png" />
        {data?.special || "None"}
      </button>
      <button onClick={() => {
        if (selectedSlot === "A") {
          onSlotSelect("");
        } else {
          onSlotSelect("A")
        }
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
        {data?.A || "None"}
      </button>
      <button onClick={() => {
         if (selectedSlot === "B") {
          onSlotSelect("");
        } else {
          onSlotSelect("B")
        }
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
        {data?.B || "None"}
      </button>
      <button onClick={() => {
        if (selectedSlot === "C") {
          onSlotSelect("");
        } else {
          onSlotSelect("C")
        }
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
        {data?.C || "None"}
      </button>
      <button onClick={() => {
         if (selectedSlot === "S") {
          onSlotSelect("");
        } else {
          onSlotSelect("S")
        }
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
        {data?.S || "None"}
      </button>
    </div>
  );
}

export default Summary;
