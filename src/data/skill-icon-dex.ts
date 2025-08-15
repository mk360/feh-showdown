const SKILL_ICON_DEX: {
    [k: string]: {
        [k: string]: string
    }
} = {};

for (let letter of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]) {
    await import(`../data/skill-icon-sheets/skills_icon_${letter}.json`).then((skills) => {
        SKILL_ICON_DEX[letter] = skills.default;
    }).catch(() => { });
}

export function getSkillUrl(skillName: string) {
    return SKILL_ICON_DEX[skillName[0]][skillName]
}

export default SKILL_ICON_DEX;