import { useState } from "react";
// import styles from '../styles/textbox.module.css';
export function Textbox({year, month, day}) {

    const [textField, handleChange] = useState("");

    const createNote = async () => {
        const url = "http://localhost:3001/api/notes/create";
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "year": year,
                    "month": month,
                    "day": day,
                    "note": textField
                })
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error(error.message);
        }

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