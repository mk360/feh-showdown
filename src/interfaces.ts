interface CargoQuery<T> {
    cargoquery: ({ title: T })[];
};

type Stats = "HP" | "Atk" | "Def" | "Res" | "Spd";

type RawHeroStats = {
    [stat in (`${Stats}GR3` | `Lv1${Stats}5`)]: string;
};

type ProcessedHeroStats = {
    hp: number;
    atk: number;
    spd: number;
    def: number;
    res: number;
    bst: number;
};

interface RawHeroIdentity {
    Name: string;
    MoveType: string;
    WeaponType: string;
    WeaponColor: string;
}

type SkillList = {
    weapon: { name: string; description: string }[];
    assist: { name: string; description: string }[];
    special: { name: string; description: string }[];
    passivea: { name: string; description: string }[];
    passiveb: { name: string; description: string }[];
    passivec: { name: string; description: string }[];
};

type HeroProperty = "Name" | "weapon" | "assist" | "special" | "passivea" | "passiveb" | "passivec";

type HeroDetails = {
    [k in HeroProperty | "id"]: string;
}
