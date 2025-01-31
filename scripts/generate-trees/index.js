import * as fs from "fs";
import characters from "../../src/data/characters.json" with { type: "json" };

const CHARACTER_TREE = {};
const WEAPON_TREE = {};
const STATS_TREE = {};
const MOVEMENT_TREE = {};


function addWordToTree(word, tree) {
    let currentNode = tree;
    for (let char of word) {
        if (!currentNode[char]) {
            currentNode[char] = {};
        }
        currentNode = currentNode[char];
    }
}

for (let Name in characters) {
    const formattedName = Name.replace(/[ :]/g, "").toLowerCase();
    addWordToTree(formattedName, CHARACTER_TREE);
    const value = characters[Name];
    WEAPON_TREE[value.color] = WEAPON_TREE[value.color] || {};
    WEAPON_TREE[value.color][value.weaponType] = WEAPON_TREE[value.color][value.weaponType] || [];
    WEAPON_TREE[value.color][value.weaponType].push(Name);

    MOVEMENT_TREE[value.movementType] = MOVEMENT_TREE[value.movementType] || [];
    MOVEMENT_TREE[value.movementType].push(Name);

    STATS_TREE[formattedName] = {
        lv1: value.stats,
        growthRates: value.growthRates,
        movementType: value.movementType,
        weaponType: value.weaponType,
        color: value.color,
    }
}

fs.writeFileSync("../public/character-tree.ts", `const CHARACTER_TREE = ${JSON.stringify(CHARACTER_TREE)}`);
fs.writeFileSync("../public/weapon-tree.ts", `const WEAPON_TREE = ${JSON.stringify(WEAPON_TREE)}`);
fs.writeFileSync("../public/movement-tree.ts", `const MOVEMENT_TREE = ${JSON.stringify(MOVEMENT_TREE)}`);
fs.writeFileSync("../public/stats.ts", `const STATS = ${JSON.stringify(STATS_TREE)}`);