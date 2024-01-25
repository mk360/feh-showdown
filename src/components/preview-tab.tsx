import { Button, TabsContent } from "@radix-ui/themes";

function PreviewTab({ team }: { team: Partial<HeroDetails & RawHeroIdentity>[] }) {
    const renderedTeam = team.filter((m) => m.Name);


    return <TabsContent value="preview">
        {renderedTeam.map((member) => {
            return <button onClick={() => {
                // setTeamTab to hero
            }} key={member.id} style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                <div style={{ height: 100 }}>
                    <img src={`/api/portrait?name=${encodeURIComponent(member.Name!)}`} style={{ width: "100%", height: "100%" }} />
                </div>
                <p>{member.Name}</p>
                <table style={{ minWidth: 256 }}>
                    <tr><td>{member.weapon || "-"}</td><td>{!!member.passivea && <img style={{ height: 30, width: 30 }} src={`/api/img?name=${encodeURIComponent(member.passivea!)}`} />} {member.passivea}</td></tr>
                    <tr><td>{member.assist || "-"}</td><td>{!!member.passiveb && <img style={{ height: 30, width: 30 }} src={`/api/img?name=${encodeURIComponent(member.passiveb!)}`} />} {member.passiveb}</td></tr>
                    <tr><td>{member.special || "-"}</td><td>{!!member.passivec && <img style={{ height: 30, width: 30 }} src={`/api/img?name=${encodeURIComponent(member.passivec!)}`} />} {member.passivec}</td></tr>
                </table>

            </button>
        })}
        {!!renderedTeam.length && (
            <Button type="submit" onClick={() => {}} variant="soft">Submit</Button>
        )}
    </TabsContent>;
};

export default PreviewTab;
