export type FEH_Stat = "atk" | "def" | "spd" | "res" | "hp"

interface StatChanges {
    [k: string]: {
        [k in FEH_Stat]?: number;
    }
}

const SKILL_STAT_CHANGES: StatChanges = {
    "Brave Axe": {
        spd: -5
    },
    "Brave Axe+": {
        spd: -5
    },
    "Brave Bow": {
        spd: -5
    },
    "Brave Bow+": {
        spd: -5
    },
    "Brave Lance": {
        spd: -5
    },
    "Brave Lance+": {
        spd: -5
    },
    "Brave Sword": {
        spd: -5
    },
    "Brave Sword+": {
        spd: -5
    },
    "Cordelia's Lance": {
        spd: -2
    },
    "Dire Thunder": {
        spd: -5
    },
    "Attack +1": {
        atk: 1,
    },
    "Attack +2": {
        atk: 2,
    },
    "Attack +3": {
        atk: 3,
    },
    "Attack/Def 1": {
        atk: 1,
        def: 1,
    },
    "Attack/Def 2": {
        atk: 2,
        def: 2
    },
    "Attack/Res 1": {
        atk: 1,
        res: 1,
    },
    "Attack/Res 2": {
        atk: 2,
        res: 2,
    },
    "Atk/Spd 1": {
        atk: 1,
        spd: 1,
    },
    "Atk/Spd 2": {
        atk: 2,
        spd: 2,
    },
    "Defense +1": {
        def: 1,
    },
    "Defense +2": {
        def: 2,
    },
    "Defense +3": {
        def: 3,
    },
    "Fortress Def 1": {
        def: 3,
        atk: -3
    },
    "Fortress Def 2": {
        def: 4,
        atk: -3
    },
    "Fortress Def 3": {
        def: 5,
        atk: -3
    },
    "Fortress Res 1": {
        res: 3,
        atk: -3
    },
    "Fortress Res 2": {
        res: 4,
        atk: -3
    },
    "Fortress Res 3": {
        res: 5,
        atk: -3
    },
    "Fury 1": {
        atk: 1,
        spd: 1,
        def: 1,
        res: 1,
    },
    "Fury 2": {
        atk: 2,
        spd: 2,
        def: 2,
        res: 2,
    },
    "Fury 3": {
        atk: 3,
        spd: 3,
        def: 3,
        res: 3,
    },
    "HP +3": {
        hp: 3,
    },
    "HP +4": {
        hp: 4,
    },
    "HP +5": {
        hp: 5,
    },
    "HP/Spd 1": {
        hp: 3,
        spd: 1,
    },
    "HP/Spd 2": {
        hp: 4,
        spd: 2,
    },
    "HP/Def 1": {
        hp: 3,
        def: 1,
    },
    "HP/Def 2": {
        hp: 4,
        def: 2,
    },
    "HP/Res 1": {
        hp: 3,
        res: 1,
    },
    "HP/Res 2": {
        hp: 4,
        def: 2,
    },
    "Life and Death 1": {
        atk: 3,
        spd: 3,
        def: -3,
        res: -3
    },
    "Life and Death 2": {
        atk: 4,
        spd: 4,
        def: -4,
        res: -4
    },
    "Life and Death 3": {
        atk: 5,
        spd: 5,
        def: -5,
        res: -5
    },
    "Resistance +1": {
        res: 1,
    },
    "Resistance +2": {
        res: 2,
    },
    "Resistance +3": {
        res: 3,
    },
    "Speed +1": {
        spd: 1,
    },
    "Speed +2": {
        spd: 2,
    },
    "Speed +3": {
        spd: 3,
    },
    "Spd/Def 1": {
        spd: 1,
        def: 1
    },
    "Spd/Def 2": {
        spd: 2,
        def: 2
    },
    "Spd/Res 1": {
        spd: 1,
        res: 1
    },
    "Spd/Res 2": {
        spd: 2,
        res: 2
    },
}

export default SKILL_STAT_CHANGES;