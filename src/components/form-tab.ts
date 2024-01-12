import { useState } from "react";
import { useForm } from "react-hook-form";

function FormTab(index: number, callback: (details: HeroDetails) => void) {
    const { register } = useForm<HeroDetails>();
    const [currentTab, setCurrentTab] = useState<"hero-list" | "hero-details">("hero-list");

};

export default FormTab;
