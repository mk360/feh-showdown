import { NextApiRequest, NextApiResponse } from "next";

export default function team(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).end();
        return;
    }

    console.log(req.body);
    res.send("bonjour");
};
