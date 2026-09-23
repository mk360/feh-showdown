import { JSX, memo } from "preact/compat";
import { capitalize } from "../utils/strings";
import getWeaponAsset from "../utils/get-weapon-asset";

const ICON_CACHE: {
  [k: string]: JSX.Element;
} = {};

function WeaponIcon({ color, type }: { color: string; type: string }) {
  const urlified = [color, type].map(capitalize).join("_");
  if (ICON_CACHE[urlified]) return ICON_CACHE[urlified];
  const generatedIcon = (
    <img
      class="game-asset"
      src={getWeaponAsset(color, type)}
    />
  );
  ICON_CACHE[urlified] = generatedIcon;

  return generatedIcon;
}

export default memo(WeaponIcon, () => false);
