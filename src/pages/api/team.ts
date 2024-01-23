import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const teamMemberSchema = z.object({
    name: z.string(),
    weapon: z.string().optional(),
    assist: z.string().optional(),
    special: z.string().optional(),
    passivea: z.string().optional(),
    passiveb: z.string().optional(),
    passivec: z.string().optional(),
});

export default async function team(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).end();
        return;
    }

    try {
        await validateTeamMember(req.body);
    } catch (e) {
        return res.status(404).send("aurevoir");
    }
    
    res.send("bonjour");
};

async function validateTeamMember(teamData: any) {
    const data = teamMemberSchema.parse(teamData);
    
};
