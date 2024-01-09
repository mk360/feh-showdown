import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, movementType, weaponType } = req.query as { name: string; movementType: string; weaponType: string };
  const domain = "https://feheroes.fandom.com/api.php";
  const urlObj = new URLSearchParams();
  urlObj.append("action", "cargoquery");
  urlObj.append("format", "json");
  urlObj.append("tables", "UnitSkills, Skills");
  urlObj.append("fields", "Skills.Name, Scategory, Description");
  urlObj.append("join_on", "UnitSkills.skill = Skills.WikiName");
  const conditions: string[] = [];
  conditions.push(`(UnitSkills._pageName = "${name}" and Skills.Exclusive = true) or (Skills.Exclusive = false)`);

  fetch(`${domain}?${urlObj.toString()}`).then((r) => {
    r.json().then((x) => {
      res.send(x);
      res.end();
    });
  });
}
