import { useContext } from "preact/hooks";
import TeamContext from "../team-context";

function SaveButton() {
    const { teamPreview, setErrors } = useContext(TeamContext);
    return <button class="save" onClick={() => {
        fetch(`${import.meta.env.VITE_API_URL}/team`, {
          method: "POST",
          headers: {
            "Authorization": localStorage.getItem("pid"),
            "Content-Type": "application/json"
          },
          body: JSON.stringify(teamPreview.filter((i) => i.name).map((rec) => {
            const payload = {
              name: rec.name ?? "",
              weapon: rec.weapon ?? "",
              assist: rec.assist ?? "",
              special: rec.special ?? "",
              A: rec.A ?? "",
              B: rec.B ?? "",
              C: rec.C ?? "",
              S: rec.S ?? "",
              asset: rec.asset ?? "",
              flaw: rec.flaw ?? "",
              merges: rec.merges ?? 0,
            };

            return payload;
          }))
        }).then((resp) => {
          localStorage.setItem("team", JSON.stringify(teamPreview.filter((i) => i.name).map((rec) => {
          const payload = {
            name: rec.name ?? "",
            weapon: rec.weapon ?? "",
            assist: rec.assist ?? "",
            special: rec.special ?? "",
            A: rec.A ?? "",
            B: rec.B ?? "",
            C: rec.C ?? "",
            S: rec.S ?? "",
            asset: rec.asset ?? "",
            flaw: rec.flaw ?? "",
            merges: rec.merges ?? 0,
          };

          return payload;
        })));
          if (resp.ok) {
            return {};
          }
          return resp.json()
        }).then((errors) => {
          if (!Object.keys(errors).length) {
            alert("Your team is ready. You will be redirected to the main page.");
            location.href = "/";
          } else {
            setErrors(errors);
          }
        }).catch(() => {
          localStorage.setItem("team", JSON.stringify(teamPreview.filter((i) => i.name).map((rec) => {
          const payload = {
            name: rec.name ?? "",
            weapon: rec.weapon ?? "",
            assist: rec.assist ?? "",
            special: rec.special ?? "",
            A: rec.A ?? "",
            B: rec.B ?? "",
            C: rec.C ?? "",
            S: rec.S ?? "",
            asset: rec.asset ?? "",
            flaw: rec.flaw ?? "",
            merges: rec.merges ?? 0,
          };

          return payload;
        })));
          alert("An unknown error happened.");
        })}} style={{ width: "100%", padding: 16, borderRadius: 10, border: "none", cursor: "pointer"}}>Save Team</button>
};

export default SaveButton;
