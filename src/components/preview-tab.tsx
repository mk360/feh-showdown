import { Button, TabsContent } from "@radix-ui/themes";

function PreviewTab({ team }: { team: Partial<HeroDetails & RawHeroIdentity>[] }) {
    const renderedTeam = team.filter((m) => m.Name);

    async function submitRequest() {
        const trimmedBody = renderedTeam.map((i) => {
            const { Name, weapon, passivea, passiveb, passivec } = i;
            return {
                name: Name,
                weapon,
                passivea,
                passiveb,
                passivec
            };
        });
        await fetch("http://localhost:3600/team/", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(trimmedBody)
        }).then(() => { });
    };

    return <TabsContent value="preview">
        {renderedTeam.map((member) => {
            return <div key={member.id} style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ height: 100 }}>
                    <img src={`/api/portrait?name=${encodeURIComponent(member.Name!)}`} style={{ width: "100%", height: "100%" }} />
                </div>
                <p>{member.Name}</p>
                <div>
                    <p>Weapon: {member.weapon || "-"}</p>
                    <p>Assist: {member.assist || "-"}</p>
                    <p>Special: {member.special || "-"}</p>
                    <p>A: {member.passivea || "-"}</p>
                    {member.passivea && <p><img style={{ height: 40, width: 40 }} src={`/api/img?name=${encodeURIComponent(member.passivea!)}`} /></p>}
                    <p>B: {member.passiveb || "-"}</p>
                    {member.passiveb && <p><img style={{ height: 40, width: 40 }} src={`/api/img?name=${encodeURIComponent(member.passiveb!)}`} /></p>}
                    <p>C: {member.passivec || "-"}</p>
                    {member.passivec && <p><img style={{ height: 40, width: 40 }} src={`/api/img?name=${encodeURIComponent(member.passivec!)}`} /></p>}
                </div>
            </div>
        })}
        {!!renderedTeam.length && (
            <Button type="submit" onClick={submitRequest} variant="soft">Submit</Button>
        )}
    </TabsContent>;
};

export default PreviewTab;
