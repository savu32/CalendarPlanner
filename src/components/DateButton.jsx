import { useState } from "react";
import styles from '../styles/textbox.module.css';
export function DateButton({ day }) {

    return (
        <button style={{flex: '0, 0, 100px', height : "100px", width:"80px",
                        backgroundColor : "white", borderColor:"black", borderWidth:"2px",
                        borderWidth:"4", display: 'flex',
                        alignItems: 'flex-start',      
                        justifyContent: 'flex-start',
                        textAlign: 'left', 
                        }}
                disabled = {day === undefined}>
            <p style={{color : "black"}}>
                {day}
            </p>
        </button>
    )
}