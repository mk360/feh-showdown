import { NextRequest } from "next/server";
import GAME_WORLDS from "./game-worlds";

export function middleware(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith("/play")) {
        console.log({ GAME_WORLDS });
        if (GAME_WORLDS[req.nextUrl.pathname.split("/").pop()!]) {
            console.log("loading from cache");
        } else {
            GAME_WORLDS[req.nextUrl.pathname.split("/").pop()!] = "bonjour";
            console.log("initiating new value");
        }
    }
};

// export const config = {
//     matcher: "/play/:gameId"
// }
