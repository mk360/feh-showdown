import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

function SkillScroller({
    data,
    onValueChange,
    value
}: {
    data: { name: string; description: string }[];
    value: string;
    onValueChange(name: string): void;
}) {
    return <ScrollArea.Root style={{ width: "100%" }} className="ScrollAreaRoot">
    <ScrollArea.Viewport className="ScrollAreaViewport">
        <ToggleGroup.Root loop={false} value={value} onValueChange={onValueChange} type="single">
        {data.map((element) => (
            <ToggleGroup.Item className="ToggleGroupItem" key={element.name} value={element.name} style={{ padding: 10, width: "100%" }}>
                <p>{element.name}</p>
                <p>{element.description}</p>
            </ToggleGroup.Item>
        ))}
        </ToggleGroup.Root>
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
