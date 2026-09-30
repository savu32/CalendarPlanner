import { useState } from "react"
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "./AuthProvider";

export function LogInView() {

    const { login } = useAuth()

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSignUp = (e) => {
        navigate("/calendar/signup");
    }

    const sendLoginRequest = () => {
        login(username, password);

        setUsername("")
        setPassword("")
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
                    onClick={sendLoginRequest}
                    style={{width:"50%", margin:"0 auto"}}>
                    <p>Log In</p>
                </button>
                <button
                    onClick={handleSignUp}
                    style={{
                        backgroundColor:"transparent",
                        border: "0 solid transparent"
                    }}>
                    <p style={{color:"white"}}>
                        Don't have an account? Click here
                    </p>
                </button>
            </div>
        </>
    )
}