type Sortable = FEHStats & { name: string };

export default function getSortingFunction(sorting: {
    [k in FEH_Stat | "name" | "bst"]: "ascending" | "descending" | "";
}) {
    const sortKey = Object.keys(sorting).find(key => sorting[key]);
    const direction = sorting[sortKey];

    return (a: Sortable, b: Sortable) => {
        if (!sortKey || !direction) return 0;
        let diff = 0;
        if (sortKey === "name") {
            diff = a.name.localeCompare(b.name);
        } else if (sortKey === "bst") {
            const bstA = a.hp + a.atk + a.spd + a.def + a.res;
            const bstB = b.hp + b.atk + b.spd + b.def + b.res;
            diff = bstA - bstB;
        } else {
            diff = a[sortKey] - b[sortKey];
        }
        return direction === "ascending" ? diff : -diff;
    };
}
