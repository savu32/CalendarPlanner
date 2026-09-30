import { useState } from "react";
import { useAuth } from "./AuthProvider";
// import styles from '../styles/textbox.module.css';

export const Textbox = ({year, month, day}) => {

    const { apiFetch } = useAuth();
    const [textField, handleChange] = useState("");

    const createNote = async () => {
        const url = "http://localhost:3001/api/notes/create";
        const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    "year": year,
                    "month": month,
                    "day": day,
                    "note": textField
                })
            }
        const result = await apiFetch(url, options);
        console.log(await result.json())

        handleChange("");
    }

    return (
        <>
            <div style = {{display: "flex", flexDirection: "column"}}>
                <div style={{height : "100px"}}>
                    <textarea
                        id="username"
                        // className={styles.box}
                        type="text"
                        value={textField}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="Note text..."
                        rows={4}
                        style={{ width: '80%', height:"80%"}}
                    />
                </div>
                <div style={{width : "15%", alignSelf:"end"}}>
                    <button 
                            onClick={() => createNote()}
                            disabled={textField === ""}
                            style = {{width:"90%"}}>
                        <p>
                            Submit
                        </p>
                    </button>
                </div> 
            </div>
        </>
    )
}