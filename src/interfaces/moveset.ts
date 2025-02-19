interface SkillWithDescription {
    name: string;
    description: string;
}

export interface SkillList {
    weapons: (SkillWithDescription & { might: number })[];
    assists: SkillWithDescription[];
    specials: (SkillWithDescription & { cooldown: number })[];
    A: SkillWithDescription[];
    B: SkillWithDescription[];
    C: SkillWithDescription[];
    S: SkillWithDescription[];
};

export interface CharacterMoveset {
    exclusiveSkills: Omit<SkillList, "S">;
    commonSkills: SkillList;
}