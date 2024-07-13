import { NextApiRequest, NextApiResponse } from 'next';

const statsFields = ["Lv1HP5", "Lv1Atk5", "Lv1Spd5", "Lv1Def5", "Lv1Res5", "HPGR3", "AtkGR3", "SpdGR3", "DefGR3", "ResGR3"] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, movementType, weaponType, weaponColor } = req.query as { name: string; movementType: string; weaponType: string; weaponColor: string };
  const domain = "https://feheroes.fandom.com/api.php";
  const fields = ["Skills.Name" as "Name", "Scategory", "Description"] as const;
  const urlObj = new URLSearchParams();

  urlObj.set("action", "cargoquery");
  urlObj.set("format", "json");
  urlObj.set("tables", "UnitSkills, Skills");
  urlObj.set("fields", fields.join(", "));
  urlObj.set("join_on", "UnitSkills.skill = Skills.WikiName");
  urlObj.set("where", `UnitSkills._pageName = "${decodeURIComponent(name)}"`);
  urlObj.set("group_by", "Name");
  urlObj.set("order_by", "Exclusive DESC, Scategory DESC, skillPos DESC");

  const skills: CargoQuery<{ [field in typeof fields[number]]: string }> = await fetch(`${domain}?${urlObj.toString()}`).then((r) => r.json());
  const mapped = skills.cargoquery.map((i) => i.title);

  urlObj.set("tables", "UnitStats");
  urlObj.set("fields", statsFields.join(", "));
  urlObj.set("where", `UnitStats._pageName = "${decodeURIComponent(name)}"`);
  urlObj.delete("group_by");
  urlObj.delete("order_by");
  urlObj.delete("join_on");

  const statsQuery: CargoQuery<RawHeroStats> = await fetch(`${domain}?${urlObj.toString()}`).then((r) => r.json());

  const dex: { [k in Exclude<HeroProperty, "Name">]: { name: string; description?: string }[] } & RawHeroStats = {
    weapon: [],
    assist: [],
    special: [],
    passivea: [],
    passiveb: [],
    passivec: [],
    ...statsQuery.cargoquery[0].title
  };

  for (let item of mapped) {
    const castScategory = item.Scategory as Exclude<HeroProperty, "Name">;
    dex[castScategory] = dex[castScategory] || [];
    dex[castScategory].push({
      name: item.Name,
      description: item.Description
    });
  }

  res.send(dex);
  res.end();
}
