import { NextApiRequest, NextApiResponse } from "next";

async function portrait(req: NextApiRequest, res: NextApiResponse) {
    const name = decodeURIComponent(req.query.name!.toString());
    const domain = "https://feheroes.fandom.com/wiki/Special:Filepath";
    const urledName = name.replace(": ", "_").replace(/ /g, "_").replace(/['"]/g, '').normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const path = `${urledName}_Face_FC.webp`;
    const response = await fetch(domain + "/" + path);
    const redirectUrl = response.url;
    const split = redirectUrl.split("/");
    split.pop();
    split.pop();
    res.redirect(split.join("/"));
    res.end();
};

export default portrait;
