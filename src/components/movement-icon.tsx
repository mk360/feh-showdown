import { JSX, memo } from "preact/compat";
import { capitalize } from "../utils/strings";

const ICON_CACHE: {
  [k: string]: JSX.Element;
} = {};

function WeaponIcon({ type }: { type: string }) {
  const urlified = capitalize(type);
  if (ICON_CACHE[urlified]) return ICON_CACHE[urlified];
  const generatedIcon = (
    <img
      class="game-asset"
      src={`https://feheroes.fandom.com/wiki/Special:Redirect/file/Icon_Move_${urlified}.png`}
    />
  );
  ICON_CACHE[urlified] = generatedIcon;

  return generatedIcon;
}

export default memo(WeaponIcon, () => false);
