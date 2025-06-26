import { CharacterMoveset } from "../interfaces/moveset";
const MOVESET_CACHE: { [k: string]: CharacterMoveset } = {};

const CACHE_LIMIT = 5;

export default async function fetchMovesets(character: string) {
    if (MOVESET_CACHE[character]) return MOVESET_CACHE[character];
    const urlParams = new URLSearchParams();
    urlParams.append("name", encodeURIComponent(character));
    const resp = await fetch(`http://localhost:3800/moveset?${urlParams.toString()}`);
    const moveset = await resp.json() as CharacterMoveset;
    const keys = Object.keys(MOVESET_CACHE);
    if (keys.length === CACHE_LIMIT) {
        delete MOVESET_CACHE[keys[0]];
    }
    MOVESET_CACHE[character] = moveset;
    return moveset;
};
