import { memo } from "preact/compat";
import WeaponIcon from "./weapon-icon";
import WEAPON_TREE from "../weapon-tree";

export default memo(function WeaponCheckbox({
  index,
  register,
  color,
  weapon,
}: {
  index: number;
  register(fieldName: string): any;
  color: string;
  weapon: string;
}) {
  const inputId = `${index}-${color}-${weapon}`;
  return (
    <>
      <input
        type="checkbox"
        id={inputId}
        class={color}
        disabled={!WEAPON_TREE[color][weapon]}
        value={color + "-" + weapon}
        {...register("weapons")}
      />
      <label for={inputId}>
        <WeaponIcon color={color} type={weapon} />
      </label>
    </>
  );
});
