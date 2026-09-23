import { useState } from "react";
// import styles from '../styles/textbox.module.css';
export function Textbox() {

    const [inputValue, handleChange] = useState("");

    return (
        <>
            <div style = {{display: "flex", flexDirection: "column"}}>
                <div style={{height : "100px"}}>
                    <textarea
                        id="username"
                        // className={styles.box}
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="Note text..."
                        rows={4}
                        style={{ width: '80%', height:"80%"}}
                    />
                </div>
                <div style={{width : "15%", alignSelf:"end"}}>
                    <button style = {{width:"90%"}}>
                        <p>
                            Submit
                        </p>
                    </button>
                </div> 
            </div>
        </>
    )
}