type Sortable = FEHStats & { name: string };

export function alphabeticSort(hero1: Sortable, hero2: Sortable, stat: FEH_Stat) {
    return hero1.name.localeCompare(hero2.name);
};

export function reverseAlphabeticSort(hero1: Sortable, hero2: Sortable, stat: FEH_Stat) {
    return hero2.name.localeCompare(hero1.name);
}

export function highestToLowest(hero1: Sortable, hero2: Sortable, stat: FEH_Stat) {
    return hero2[stat] - hero1[stat];
};

export function lowestToHighest(hero1: Sortable, hero2: Sortable, stat: FEH_Stat) {
    return hero1[stat] - hero2[stat];
};

export default function getSortingFunction(state: {
    [k in FEH_Stat | "name" | "bst"]: "ascending" | "descending" | "";
}) {
    const stateData = Object.entries(state);
    const sortKey = stateData.find(([, value]) => value !== "");
    if (!sortKey) {
        return (_: Sortable, _2: Sortable) => 0;
    }
    const [key, direction] = sortKey;
    if (key === "name") {
        if (direction === "descending") {
            return (hero1: Sortable, hero2: Sortable) => {
                return hero1.name.localeCompare(hero2.name);
            };
        } else {
            return (hero1: Sortable, hero2: Sortable) => {
                return hero2.name.localeCompare(hero1.name);
            };
        }
    } else if (key !== "bst") {
        if (direction === "descending") {
            return (hero1: Sortable, hero2: Sortable) => {
                return hero2[key] - hero1[key];
            };
        }
        return (hero1: Sortable, hero2: Sortable) => {
            return hero1[key] - hero2[key];
        };
    } else {
        if (direction === "descending") {
            return (hero1: Sortable, hero2: Sortable) => {
                const hero1BST = hero1.hp + hero1.atk + hero1.spd + hero1.def + hero1.res;
                const hero2BST = hero2.hp + hero2.atk + hero2.spd + hero2.def + hero2.res;
                return hero2BST - hero1BST;
            };
        }
        return (hero1: Sortable, hero2: Sortable) => {
            const hero1BST = hero1.hp + hero1.atk + hero1.spd + hero1.def + hero1.res;
            const hero2BST = hero2.hp + hero2.atk + hero2.spd + hero2.def + hero2.res;
            return hero1BST - hero2BST;
        };
    }
}
