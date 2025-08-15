import SKILL_STAT_CHANGES from "../data/buffs";
import STATS from "../stats";

const statLabels = ["hp", "atk", "spd", "def", "res"];

export function convertToSingleLevel40(stat1: number, growthRate: number) {
    const appliedGrowthRate = Math.floor(growthRate * 1.14 + 1e-10);
    const growthValue = Math.floor((39 * appliedGrowthRate) / 100);
    return stat1 + growthValue;
}

export function getLevel40Stats(options: {
    character: string;
    asset: FEH_Stat | "",
    flaw: FEH_Stat | "",
}) {
    const baseGrowthRate = STATS[options.character].growthRates;
    const baseLevel1 = STATS[options.character].lv1;
    const finalStats: { [k in FEH_Stat]: number } = {
        hp: 0,
        atk: 0,
        spd: 0,
        def: 0,
        res: 0
    };

    for (let stat in baseLevel1) {
        const finalGrowthRate =
            stat === options.asset
                ? baseGrowthRate[stat] + 5
                : stat === options.flaw
                    ? baseGrowthRate[stat] - 5
                    : baseGrowthRate[stat];
        const finalLevel1 =
            stat === options.asset
                ? baseLevel1[stat] + 1
                : stat === options.flaw
                    ? baseLevel1[stat] - 1
                    : baseLevel1[stat];
        const level40Stat = convertToSingleLevel40(finalLevel1, finalGrowthRate);
        finalStats[stat] = level40Stat;
    }

    return finalStats;
};

export function getExtraStats(moveset: {
    weapon: string,
    assist: string,
    special: string,
    A: string,
    B: string,
    C: string,
    S: string
}) {
    const stats: { [k in FEH_Stat]?: number } = {
        hp: 0,
        atk: 0,
        spd: 0,
        def: 0,
        res: 0,
    };

    for (let key in moveset) {
        const skillStatChange = SKILL_STAT_CHANGES[moveset[key]];
        if (skillStatChange) {
            for (let changedStat in skillStatChange) {
                stats[changedStat] += skillStatChange[changedStat];
            }
        } else {
            if (key === "weapon") {
                console.warn("Couldn't find stats for the weapon " + moveset[key]);
            }
        }
    }

    return stats;
};

export function withMerges(stats: FEHStats, merges: number, asset: FEH_Stat | "", flaw: FEH_Stat | "") {
    const alteredStats = { asset, flaw };
    const sortedStats = Object.entries(stats)
        .sort(([b, stat1], [a, stat2]) => {
            const statDifference = stat2 - stat1;
            if (!statDifference)
                return statLabels.indexOf(b) - statLabels.indexOf(a);
            return statDifference;
        })
        .map(([stat, value]) => ({
            stat,
            value,
        }));
    const firstStatChange =
        alteredStats.asset && alteredStats.flaw ? [0, 1] : [0, 1, 2];
    const statChanges = [
        firstStatChange,
        [2, 3],
        [4, 0],
        [1, 2],
        [3, 4],
        [0, 1],
        [2, 3],
        [4, 0],
        [1, 2],
    ];

    for (let i = 0; i < merges; i++) {
        let mod5 = i % 5;
        let increase = statChanges[mod5];
        for (let index of increase) {
            sortedStats[index].value++;
        }
    }

    const splitStats = Object.groupBy(sortedStats, (s) => s.stat);

    const obj: { [k in FEH_Stat]: number } = {
        hp: splitStats["hp"][0]?.value,
        atk: splitStats["atk"][0]?.value,
        spd: splitStats["spd"][0]?.value,
        def: splitStats["def"][0]?.value,
        res: splitStats["res"][0]?.value,
    };

    return obj;
};