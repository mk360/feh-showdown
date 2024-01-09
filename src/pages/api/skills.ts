import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, movementType, weaponType, weaponColor } = req.query as { name: string; movementType: string; weaponType: string; weaponColor: string };
  const domain = "https://feheroes.fandom.com/api.php";
  const fields = ["Name", "Scategory", "Description"] as const;
  const urlObj = new URLSearchParams();
  urlObj.append("action", "cargoquery");
  urlObj.append("format", "json");
  urlObj.append("limit", "5000");
  urlObj.append("tables", "UnitSkills, Skills");
  urlObj.append("fields", fields.join(", "));
  urlObj.append("join_on", "UnitSkills.skill = Skills.WikiName");
  const conditions: string[] = [];
  conditions.push(`(UnitSkills._pageName = "${decodeURIComponent(name)}" and Skills.Exclusive = true) or (Skills.Exclusive = false and Skills.CanUseMove holds "${movementType}" and Skills.CanUseWeapon holds "${weaponColor} ${weaponType}")`);
  urlObj.append("where", conditions.join(""));
  urlObj.append("group_by", "Name");
  fetch(`${domain}?${urlObj.toString()}`).then((r) => {
    r.json().then((x: CargoQuery<{ [f in typeof fields[number]]: string }>) => {
      const mapped = x.cargoquery.map((i) => i.title);
      const obj: { [k: string]: { name: string; description: string }[] } = {};
      for (let item of mapped) {
        obj[item.Scategory] = obj[item.Scategory] || [];
        obj[item.Scategory].push({
          name: item.Name,
          description: item.Description
        });
      }
      res.send(obj);
      res.end();
    });
  });
}
