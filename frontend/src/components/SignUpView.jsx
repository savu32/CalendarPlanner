import { useState } from "react"

export function SignUpView() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const sendSignUpRequest = (e) => {
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
                    onClick={sendSignUpRequest}
                    style={{width:"50%", margin:"0 auto"}}>
                    <p>Sign up</p>
                </button>
            </div>
        </>
    )
}