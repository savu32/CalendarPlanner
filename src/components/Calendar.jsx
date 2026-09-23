import { useNavigate, useParams } from 'react-router-dom';
import { Month } from "./Month";
import { useEffect } from 'react';

export function Calendar() {

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    const { year, month, day } = useParams();
    const navigate = useNavigate();

    const yearNum = Number(year);
    const monthId = Number(month);
    const dayNum = Number(day);

    const today = new Date();
    
    useEffect(() => {
        if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > 2099) {
            navigate(`/calendar/${today.getFullYear()}/${today.getMonth()+1}`);
        }
        if (Number.isNaN(monthId) || monthId < 1 || monthId > 12) {
            navigate(`/calendar/${yearNum}/${1}`);
        }
    }, [dayNum, monthId, yearNum, navigate])

    const reduceMonth = (event) => {
        if (monthId === 1) {
            navigate(`/calendar/${yearNum-1}/${12}`);
        } else {
            navigate(`/calendar/${yearNum}/${monthId-1}`);
        }
    }

    const increaseMonth = (event) => {
        if (monthId === 12) {
            navigate(`/calendar/${yearNum+1}/${1}`);
        } else {
            navigate(`/calendar/${yearNum}/${monthId+1}`);
        }
    }

    const getDaysInMonth = (monthId) => {
        if (monthId === 1) {
            if (yearNum % 4 === 0 && yearNum % 400 !== 0) {
                return 29;
            }
        }
        return daysInMonths[monthId];
    }

    return (
        <>
            <div>
                <div style = {{display : "flex", justifyContent : "center", gap : "10px"}}>
                    <button onClick={reduceMonth} style={{backgroundColor : "black", borderWidth:"0"}}>{"<"}</button>
                    <h2 style={{width : "160px"}}>{months[monthId-1]} {yearNum}</h2>
                    <button onClick={increaseMonth} style={{backgroundColor : "black", borderWidth:"0"}}>{">"}</button>
                </div>
                <Month daysInMonth={getDaysInMonth(monthId-1)} />
            </div>
        </>
    )
}