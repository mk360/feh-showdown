import getLv40Stat from "@/utils/get-lv40-stats";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

const THRESHOLD = "2028-11-28";

const heroQuery = z.object({
    name: z.string().optional(),
    weaponType: z.enum([
        "Red Sword", "Blue Lance", "Green Axe", "Colorless Staff",
        "Red Bow", "Blue Bow", "Green Bow", "Colorless Bow",
        "Red Dagger", "Blue Dagger", "Green Dagger", "Colorless Dagger",
        "Red Tome", "Blue Tome", "Green Tome", "Colorless Tome",
        "Red Breath", "Blue Breath", "Green Breath", "Colorless Breath",
        "Red Beast", "Blue Beast", "Green Beast", "Colorless Beast"
    ]).array().optional(),
    color: z.enum(["Red", "Blue", "Green", "Colorless"]).array().optional(),
    movement: z.enum(["Infantry", "Armored", "Flying", "Cavalry"]).array().optional(),
});

async function heroes(req: NextApiRequest, res: NextApiResponse) {
    if (req.query.weaponType) req.query.weaponType = (req.query.weaponType! as string).split(",");
    if (req.query.movement) req.query.movement = (req.query.movement! as string).split(",");
    if (req.query.color) req.query.color = (req.query.color! as string).split(",");

    const { name, weaponType, movement, color } = heroQuery.parse(req.query);
    const domain = "https://feheroes.fandom.com/api.php";
    const urlQuery = new URLSearchParams();
    urlQuery.append("action", "cargoquery");
    urlQuery.append("tables", "Units, UnitStats");
    urlQuery.append("format", "json");
    urlQuery.append("limit", "5000");
    const fields = ["Units._pageName=Name", "MoveType", "WeaponType", "HPGR3", "Lv1HP5", "AtkGR3", "Lv1Atk5", "SpdGR3", "Lv1Spd5", "DefGR3", "Lv1Def5", "ResGR3", "Lv1Res5"];
    const conditions: string[] = ["Properties holds not \"enemy\""];
    urlQuery.append("join_on", "Units._pageName=UnitStats._pageName");
    urlQuery.append("group_by", "Units._pageName");

    if (name) {
        conditions.push(`Units._pageName like "${name}%"`);
    }

    if (weaponType || color) {
        let weaponQuery: string[] = [];

        if (weaponType) {
            weaponQuery = weaponQuery.concat(weaponType.map((weapon) => `WeaponType = "${weapon}"`));
        }

        if (color) {
            weaponQuery = weaponQuery.concat(color.map((v) => `WeaponType like "${v} %"`));
        }

        if (weaponQuery) {
            conditions.push(`(${weaponQuery.join(" or ")})`);
        }
    }

    if (movement) {
        const movementConditions = movement.map((mvt) => `MoveType = "${mvt}"`).join(" or ");
        conditions.push(`(${movementConditions})`);
    }

    conditions.push(`ReleaseDate < "${THRESHOLD}"`);

    urlQuery.append("where", conditions.map((v) => `(${v})`).join(" and "));

    const r = await fetch(`${domain}?${urlQuery.toString()}&fields=${fields.join(",")}`);

    const data = await r.json() as CargoQuery<RawHeroIdentity & RawHeroStats>;
    const heroesWithStats = data.cargoquery.map((i) => {
        const { Name, MoveType, WeaponType, HPGR3, Lv1HP5, AtkGR3, Lv1Atk5, DefGR3, Lv1Def5, SpdGR3, Lv1Spd5, ResGR3, Lv1Res5 } = i.title;

        const hp = getLv40Stat(+Lv1HP5, +HPGR3, false, false);
        const atk = getLv40Stat(+Lv1Atk5, +AtkGR3, false, false);
        const def = getLv40Stat(+Lv1Def5, +DefGR3, false, false);
        const spd = getLv40Stat(+Lv1Spd5, +SpdGR3, false, false);
        const res = getLv40Stat(+Lv1Res5, +ResGR3, false, false);
        const bst = hp + atk + spd + def + res;
        const [weaponColor, weaponType] = WeaponType.split(" ");

        return {
            Name: Name.replace(/&quot;/g, '"'),
            MoveType,
            WeaponColor: weaponColor,
            WeaponType: weaponType,
            hp,
            atk,
            spd,
            def,
            res,
            bst
        };
    });
    res.send(heroesWithStats);
};

export default heroes;
