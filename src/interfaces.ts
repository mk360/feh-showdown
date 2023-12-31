interface CargoQuery<T> {
    cargoquery: ({ title: T })[];
};

type Stats = "HP" | "Atk" | "Def" | "Res" | "Spd";

type RawHeroStats = {
    [stat in (`${Stats}GR3` | `Lv1${Stats}5`)]: string;
};

interface RawHeroIdentity {
    Name: string;
    MoveType: string;
    WeaponType: string;
}
