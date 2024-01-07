import { NextApiRequest, NextApiResponse } from "next";

async function heroes(req: NextApiRequest, res: NextApiResponse) {
    const { name, weaponType, movementType, book, color } = req.query;
};

export default heroes;
