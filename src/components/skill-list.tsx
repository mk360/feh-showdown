import { UseFormRegisterReturn } from "react-hook-form";
import { SkillList } from "../interfaces/moveset";

interface SkillListProps {
    skills: SkillWithDescription[];
    labelColor: string;
    registerHook: UseFormRegisterReturn<keyof SkillList>;
    onChange(skill: { name: string; description: string }): void;

}

function SkillList(props: SkillListProps) {

};

export default SkillList;
