export default function getWeaponAsset(color: string, weapon: string) {
  return `/teambuilder/weapons/${color}_${weapon}.webp`;
}