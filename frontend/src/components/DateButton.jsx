import { useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/textbox.module.css';

export function DateButton({ day }) {

    const { year, month } = useParams();
    const navigate = useNavigate();

    const yearNum = Number(year);
    const monthId = Number(month);

    const openDateView = (year, month, day) => {
        navigate(`/calendar/${year}/${month}/${day}`);
    }

    return (
        <>
            <button style={{flex: '0, 0, 100px', height : "100px", width:"80px",
                            backgroundColor : "white", borderColor:"black", borderWidth:"2px",
                            borderWidth:"4", display: 'flex',
                            alignItems: 'flex-start',      
                            justifyContent: 'flex-start',
                            textAlign: 'left', 
                            }}
                    onClick = {() => openDateView(year, month, day)}
                    disabled = {day === undefined}>
                <p style={{color : "black"}}>
                    {day}
                </p>
            </button>
        </>
    )
}