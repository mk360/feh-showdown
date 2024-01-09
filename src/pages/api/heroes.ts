import { NextApiRequest, NextApiResponse } from "next";

async function heroes(req: NextApiRequest, res: NextApiResponse) {
    const { name, weaponType, movement, color } = req.query;
    const domain = "https://feheroes.fandom.com/api.php";
    const urlQuery = new URLSearchParams();
    urlQuery.append("action", "cargoquery");
    urlQuery.append("tables", "Units, UnitStats");
    urlQuery.append("format", "json");
    urlQuery.append("limit", "500");
    const fields = ["Units._pageName=Name", "MoveType", "WeaponType", "HPGR3", "Lv1HP5", "AtkGR3", "Lv1Atk5", "SpdGR3", "Lv1Spd5", "DefGR3", "Lv1Def5", "ResGR3", "Lv1Res5"];
    const conditions: string[] = [`ReleaseDate <= "2017-12-31"`];
    urlQuery.append("join_on", "Units._pageName=UnitStats._pageName");

    if (name) {
        conditions.push(`Units._pageName like "${name}%"`);
    }

    if (weaponType || color) {
        const colorQuery = (color + " " + weaponType).trim();
        conditions.push(`WeaponType like "%${colorQuery}%"`);
    }

    if (movement) {
        conditions.push(`MoveType = "${movement}"`);
    }

    urlQuery.append("where", conditions.map((v) => `(${v})`).join(" and "));
    const r = await fetch(`${domain}?${urlQuery.toString()}&fields=${fields.join(",")}`);

    const data = await r.json() as CargoQuery<RawHeroIdentity & RawHeroStats>;
    const heroesWithStats = data.cargoquery.map((i) => {
        const { Name, MoveType, WeaponType, HPGR3, Lv1HP5, AtkGR3, Lv1Atk5, DefGR3, Lv1Def5, SpdGR3, Lv1Spd5, ResGR3, Lv1Res5 } = i.title;

        const hp = getLv40Stat(+Lv1HP5, +HPGR3);
        const atk = getLv40Stat(+Lv1Atk5, +AtkGR3);
        const def = getLv40Stat(+Lv1Def5, +DefGR3);
        const spd = getLv40Stat(+Lv1Spd5, +SpdGR3);
        const res = getLv40Stat(+Lv1Res5, +ResGR3);
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

function getLv40Stat(lv1Stat: number, growthRate: number) {
    return Number(lv1Stat) + Math.floor(Math.floor(+growthRate * 1.14) * 39 / 100);
}

export default heroes;
