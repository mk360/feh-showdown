import { useContext } from "preact/hooks";
import TeamContext from "../team-context";

function ErrorSection() {
    const { errors, setErrors } = useContext(TeamContext);
    return !!Object.keys(errors).length && (
        <div class="errors">
            <button id="clear-errors" onClick={() => {
                setErrors({});
            }}></button>
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
