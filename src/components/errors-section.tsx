import { useContext } from "preact/hooks";
import TeamContext from "../team-context";

function ErrorSection() {
    const { errors } = useContext(TeamContext);
    return !!Object.keys(errors).length && (
        <div class="errors">
            There were some errors with your team:
            <ul>
                {Object.keys(errors).map((errorKey) => (
                    <li key={errorKey}>{errors[errorKey].join(". ")}</li>
                ))}
            </ul>
        </div>
    );
};

export default ErrorSection;
