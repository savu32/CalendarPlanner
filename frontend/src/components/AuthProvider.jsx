import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [username, setUsername] = useState(null);
    // initially using only JWT access tokens, will update to add long-lived session tokens
    // will log user out on refresh
    const [token, setToken] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const url = `http://localhost:3001/api/me`;
        const fetchResponse = async () => {
            try {
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                });
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                const result = await response.json();
                const parsed = result.response.split(" ")
                if (parsed.length == 2) {
                    setUsername(parsed[1]);
                }
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchResponse();
    }, [])

    async function login(username, password) {
        const url = "http://localhost:3001/api/login"
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ "username": username, "password": password }),
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        console.log(result.response);
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ username, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
