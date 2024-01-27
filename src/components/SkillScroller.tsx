import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Accordion from "@radix-ui/react-accordion";

function SkillScroller({
    data,
    onValueChange,
    value
}: {
    data: { name: string; description: string }[];
    value: string;
    onValueChange(name: string): void;
}) {
    // mettre le skill dans un accordion: nom dans le titre, et description dans le body
    // faire une navigation en onglets verticaux pour changer d'équipes, mettre un troisième onglet pour la preview & le lancement de la partie
    // valider l'équipe avec le preview, du coup si l'équipe change, la personne devra submit l'équipe à nouveau
    return <ScrollArea.Root style={{ width: "100%" }} className="ScrollAreaRoot">
        <ScrollArea.Viewport className="ScrollAreaViewport">
            {!!data.length ? (
                <Accordion.Root value={value} onValueChange={onValueChange} type="single">
                    {data.map((element) => (
                        <Accordion.Item className="ToggleGroupItem" key={element.name} value={element.name} style={{ padding: 10, width: "100%" }}>
                            <Accordion.Trigger style={{ width: "100%" }}>{element.name}</Accordion.Trigger>
                            <Accordion.Content>{element.description}</Accordion.Content>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>
            ) : <div style={{ textAlign: "center", height: "100%", verticalAlign: "center" }}>No skill available</div>}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="ScrollAreaScrollbar" orientation="vertical">
            <ScrollArea.Thumb className="ScrollAreaThumb" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar className="ScrollAreaScrollbar" orientation="horizontal">
            <ScrollArea.Thumb className="ScrollAreaThumb" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className="ScrollAreaCorner" />
    </ScrollArea.Root>
};

export default SkillScroller;
