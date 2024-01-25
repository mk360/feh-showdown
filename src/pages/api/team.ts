import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import shortid from "shortid";
import GAME_WORLDS from "@/game-worlds";

const teamMemberSchema = z.object({
    name: z.string(),
    weapon: z.string().optional(),
    assist: z.string().optional(),
    special: z.string().optional(),
    passivea: z.string().optional(),
    passiveb: z.string().optional(),
    passivec: z.string().optional(),
}).strict();

const requestBody = teamMemberSchema.array();

export default async function team(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).end();
        return;
    }

    try {
        await validateTeams(req.body);
    } catch (e: any) {
        if (e instanceof ZodError) {
            return res.status(400).send(e.flatten());
        } else {
            console.log(e);
            return res.status(500).send(e.message);
        }
    }

    const id = shortid();
    GAME_WORLDS[id] = shortid();

    return res.status(200).send(id);
};

async function validateTeams(teamData: any) {
    const data = requestBody.parse(teamData);
    const heroNames = Array.from(new Set(data.map((hero) => hero.name)));

    const url = "https://feheroes.fandom.com/api.php";
    const urlQuery = new URLSearchParams();
    urlQuery.set("format", "json");
    urlQuery.set("action", "cargoquery");
    urlQuery.set("tables", "Units");
    urlQuery.set("fields", "Units._pageName=Page");
    urlQuery.set("where", `Units._pageName in (${heroNames.map((d) => `"${d}"`).join(", ")})`);
    urlQuery.set("group_by", "Units._pageName");
    const response = await fetch(`${url}?${urlQuery.toString()}`);
    const heroNameData: CargoQuery<{ Page: string }> = await response.json();
    const allHeroesExist = heroNameData.cargoquery.length === heroNames.length;

    if (!allHeroesExist) throw new Error("Some heroes are invalid");

    const skillsList = Array.from(new Set(data.map((hero) => {
        const { name, ...skills } = hero;
        return Object.values(skills);
    }).flat()));

    urlQuery.set("tables", "Skills");
    urlQuery.set("fields", "Skills._pageName=Page");
    urlQuery.set("where", `Skills.Name in (${skillsList.map((d) => `"${d}"`).join(", ")})`);
    urlQuery.set("group_by", "Skills.Name");
    const skillsResponse = await fetch(`${url}?${urlQuery.toString()}`);
    const skillsData: CargoQuery<{ Page: string }> = await skillsResponse.json();
    const allSkillsExist = skillsData.cargoquery.length === skillsList.length;

    if (!allSkillsExist) {
        throw new Error("Some skills are invalid");
    }
};
