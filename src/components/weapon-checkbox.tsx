import { memo } from "preact/compat";

export default memo(function WeaponCheckbox({
  index,
  register,
  color,
  weapon,
  url,
}: {
  index: number;
  register(fieldName: string): any;
  color: string;
  weapon: string;
  url: string;
}) {
  const inputId = `${index}-${color}-${weapon}`;
  return (
    <>
      <input
        type="checkbox"
        id={inputId}
        class={color}
        value={color + "-" + weapon}
        {...register("weapons")}
      />
      <label for={inputId}>
        <img class="game-asset" src={url} />
      </label>
    </>
  );
});
