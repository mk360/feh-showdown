import { TabsContent } from "@radix-ui/themes";

function PreviewTab({ team }: { team: Partial<HeroDetails>[] }) {
    return <TabsContent value="preview">
        {team.filter((m) => m.name).map((member) => {
            return <div key={member.id} style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ height: 100 }}>
                    <img src={`/api/portrait?name=${encodeURIComponent(member.name!)}`} style={{ width: "100%", height: "100%"}} />
                </div>
                <p>{member.name}</p>
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
    </TabsContent>;
};

export default PreviewTab;