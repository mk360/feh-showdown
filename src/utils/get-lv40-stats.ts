export default function getLv40Stat(lv1Stat: number, growthRate: number, boon: boolean, bane: boolean) {
    const fixedLv1Stat = boon ? lv1Stat + 1 : bane ? lv1Stat - 1 : lv1Stat;
    return Number(fixedLv1Stat) + Math.floor(Math.floor(growthRate * 1.14) * 39 / 100);
}