import { useNavigate, useParams } from 'react-router-dom';
import { Month } from "./Month";
import { useEffect } from 'react';
import { useAuth } from "./AuthProvider";

export function Calendar() {

    const { username, login, logout } = useAuth();

    //, border: '2px dashed #3498db'
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

    const goToLogin = () => {
        navigate('/calendar/login');
    }

    return (
        <>
            <div style = {{display:"flex", flexDirection:"column", gap:"2px"}}>
                <div style = {{display : "flex", flexDirection:"row", alignItems:"center", gap : "10px", padding:"5px"}}>
                    <button disabled = {true} style={{ visibility: "hidden", justifySelf:"flex-start", alignSelf:"center"}}>Log in</button>
                    <button onClick={reduceMonth} style={{backgroundColor : "black", marginLeft:"auto", borderWidth:"0"}}>{"<"}</button>
                    <h2 style={{width : "160px",  alignSelf:"center"}}>{months[monthId-1]} {yearNum}</h2>
                    <button onClick={increaseMonth} style={{backgroundColor : "black", marginRight:"auto", borderWidth:"0"}}>{">"}</button>
                    { username === null ? 
                        <button onClick={goToLogin} style={{justifySelf:"flex-end"}}>Log in</button> 
                        : 
                        <p>{username}</p> }
                </div>
                <Month daysInMonth={getDaysInMonth(monthId-1)} />
            </div>
        </>
    )
}