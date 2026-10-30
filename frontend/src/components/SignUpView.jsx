import { useState } from "react"
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./AuthProvider";

export function SignUpView() {

    const { signup } = useAuth()

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");    
    const navigate = useNavigate();

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const sendSignUpRequest = (e) => {
        signup(username, password);

        setUsername("");
        setPassword("");
    }

    const goBack = () => {
        navigate(`/calendar/login`);
    }

    return (
        <>
            <div style = {{display : "flex", 
                            flexDirection : "column",
                            width: "40%",
                            // border: '2px dashed #3498db',
                            margin:"0 auto",
                            padding:"20px 0",
                            textAlign:"center",
                            gap:"10px"
                            }}>
                <button onClick={() => goBack()}>
                    <p>Return</p>
                </button>
                <div style={{margin:"0 auto"}}>
                    <input
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="Username"
                    />
                    <input
                        type="text"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Password"
                    />
                </div>
                <button
                    onClick={sendSignUpRequest}
                    style={{width:"50%", margin:"0 auto"}}>
                    <p>Sign up</p>
                </button>
            </div>
        </>
    )
}