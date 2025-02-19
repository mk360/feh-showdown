export default function convertToSingleLevel40(stat1: number, growthRate: number) {
    const appliedGrowthRate = Math.floor(growthRate * 1.14 + 1e-10);
    const growthValue = Math.floor((39 * appliedGrowthRate) / 100);
    return stat1 + growthValue;
}