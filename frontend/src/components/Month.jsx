import { useState } from "react";
import { DateButton } from "./DateButton";

export function Month({ daysInMonth }) {
    let weeks = []
    let days = []
    let spaces = daysInMonth === 28 ? 28 : 35;
    for (let i = 1; i <= spaces; i++) {
        days.push(i);
        if (i % 7 == 0) {
            weeks.push(
                <div key={i} style={{ display: 'flex', flexDirection : "row", flex : "0 0 auto", gap: '1px', 
                    justifyContent : "center"
                }}>
                    {days.map((day) => <DateButton key={day} day={day <= daysInMonth ? day : undefined} />)}
                </div>
            )
            days = []
        }
    }

    return (
        <>
            <div>
                {weeks}
            </div>
        </>
        
    )
}