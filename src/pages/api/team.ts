import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";

const teamMemberSchema = z.object({
    name: z.string(),
    weapon: z.string().optional(),
    assist: z.string().optional(),
    special: z.string().optional(),
    passivea: z.string().optional(),
    passiveb: z.string().optional(),
    passivec: z.string().optional(),
});

const requestBody = z.object({
    team1: teamMemberSchema.array()
}).strict();

export default async function team(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).end();
        return;
    }

    try {
        const validated = await validateTeams(req.body);

        if (!validated) {
            return res.status(400).send("Invalid data");
        }
    } catch (e: unknown) {
        if (e instanceof ZodError) {
            return res.status(400).send(e.flatten());
        } else {
            console.log(e);
            return res.status(500).send("");
        }
    }

    return res.send("bonjour");
};

async function validateTeams(teamData: any) {
    const data = requestBody.parse(teamData).team1;
    const heroNames = Array.from(new Set(data.map((hero) => hero.name)));
    const skillsList = Array.from(new Set(data.map((hero) => {
        const { name, ...skills } = hero;
        return Object.values(skills);
    }).flat()));

    const url = "https://feheroes.fandom.com/api.php";
    const urlQuery = new URLSearchParams();
    urlQuery.append("format", "json");
    urlQuery.append("action", "cargoquery");
    urlQuery.append("tables", "Units");
    urlQuery.append("fields", "Units._pageName=Page");
    urlQuery.append("where", `Units._pageName in (${heroNames.map((d) => `"${d}"`).join(", ")})`);
    const response = await fetch(`${url}?${urlQuery.toString()}`);
    const heroNameData: CargoQuery<{ Page: string }> = await response.json();
    const allHeroesExist = heroNameData.cargoquery.length === heroNames.length;

    if (!allHeroesExist) return false;

    urlQuery.set("tables", "Skills");
    urlQuery.set("fields", "Skills._pageName=Page");
    urlQuery.set("where", `Skills.Name in (${skillsList.map((d) => `"${d}"`).join(", ")})`);
    const skillsResponse = await fetch(`${url}?${urlQuery.toString()}`);
    const skillsData: CargoQuery<{ Page: string }> = await skillsResponse.json();
    const allSkillsExist = skillsData.cargoquery.length === skillsList.length;

    return allSkillsExist;
};
