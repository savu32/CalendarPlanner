import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Textbox } from './Textbox';
import { NotesView } from './NotesView';

export function DateView() {

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    const { year, month, day } = useParams();
    const navigate = useNavigate();

    const yearNum = Number(year);
    const monthId = Number(month);
    const dayNum = Number(day);

    const [notes, updateNotes] = useState([])
    
    useEffect(() => {
        if (Number.isNaN(yearNum) || yearNum < 1) {
            navigate(`/calendar/${today.getFullYear()}/${today.getMonth()+1}`);
        }
        if (Number.isNaN(monthId) || monthId < 1 || monthId > 12) {
            navigate(`/calendar/${yearNum}/${1}`);
        }
        if (Number.isNaN(dayNum) || dayNum < 1 || dayNum > daysInMonths[monthId-1]) {
            navigate(`/calendar/${yearNum}/${monthId}`);
        }

        getNotes();

    }, [])

    const getNotes = async () => {
        const url = `http://localhost:3001/api/notes/list?year=${year}&month=${month}&day=${day}`;
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            updateNotes(result);
        } catch (error) {
            console.error(error.message);
        }
    }

    const formatDay = (day) => {
        if (day === 1 || day === 21 || day == 31) {
            return String(day) + "st"
        } else if (day === 2 || day == 22) {
            return String(day) + "nd"
        } else if (day === 3 || day == 23) {
            return String(day) + "rd"
        } else {
            return String(day) + "th"
        }
    }

    const goBack = () => {
        navigate(`/calendar/${yearNum}/${monthId}`);
    }

    return (
        <>
            <div>
                <div style = {{display : "flex", justifyContent : "center", paddingLeft:"5px", paddingBottom : "20px"}}>
                    <button onClick={() => goBack()}>
                        <p>Return</p>
                    </button>
                    <h2 style={{ margin: '0 auto' }}>{months[monthId-1]} {formatDay(dayNum)}, {yearNum}</h2>
                    <div style={{visibility: "hidden", marginLeft: "10px"}}><p>Return</p></div>
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:"30px"}}>
                    <Textbox year={yearNum} month={monthId} day={dayNum}/>
                    <NotesView notesText={notes}/>
                </div>
            </div>
        </>
    )
}