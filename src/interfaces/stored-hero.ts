type FEH_Stat = "atk" | "def" | "spd" | "res" | "hp";

type FEHStats = {
    [k in FEH_Stat]: number;
};

interface StoredHero {
    name: string;
    weapon: string;
    assist: string;
    special: string;
    merges: number;
    A: string;
    B: string;
    C: string;
    S: string;
    asset: FEH_Stat | "";
    flaw: FEH_Stat | "";
    stats: FEHStats;
    summonerSupport?: "C" | "B" | "A" | "S";
    allySupport?: {
        ally: string;
        level: "C" | "B" | "A" | "S";
    }
}

interface AllySupportMap {
    allySupport: {
        [member: string]: {
            ally: string;
            level: "C" | "B" | "A" | "S";
        }
    };
    summonerSupport: {
        [member: string]: {
            ally: string;
            level: "C" | "B" | "A" | "S";
        }
    }
}