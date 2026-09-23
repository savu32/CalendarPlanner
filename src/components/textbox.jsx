import { useState } from "react";
import styles from '../styles/textbox.module.css';
export function Textbox() {

    const [inputValue, handleChange] = useState("");

    return (
        <>
            <input
                id="username"
                className={styles.box}
                type="text"
                value={inputValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Type something here..."
            />
        </>
    )
}