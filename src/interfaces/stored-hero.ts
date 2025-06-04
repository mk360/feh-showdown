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
    passive_a: string;
    passive_b: string;
    passive_c: string;
    passive_s: string;
    asset: FEH_Stat | "";
    flaw: FEH_Stat | "";
    stats: FEHStats;
}