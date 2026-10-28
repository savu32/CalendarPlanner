import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [username, setUsername] = useState(null);
    const token = useRef(null); // JWT access token
    const [loading, setLoading] = useState(true);
    let inflightRefresh = null; // store current refresh briefly so StrictMode remount reuses it

    useEffect(() => {
        const populate = async () => {
            try {
                const res = await refresh();
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        }
        populate();
    }, [])

    const refresh = useCallback(async () => {
        const fetchRefresh = async () => {
            try {
                inflightRefresh = await fetch('http://localhost:3001/api/auth/refresh', {
                    method: 'POST',
                    credentials: 'include',
                })
                if (!inflightRefresh.ok) {
                    throw new Error('Failed token refresh');
                }
                const result = inflightRefresh;
                const data = await result.json();
                if (data) {
                    token.current = data.token;
                    setUsername(data.user["username"]);
                }
                return data;
            } catch (error) {
                console.error(error.message);
            } finally {
                inflightRefresh = null;
            }
        }
        if (!inflightRefresh) {
            await fetchRefresh();
        }
        return inflightRefresh;
    }, []);

    const login = async (username, password) => {
        const url = "http://localhost:3001/api/auth/login"
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "username": username, "password": password }),
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        const resultResponse = result.response.split(" ");
        setUsername(resultResponse[0]);
        token.current = resultResponse[1];
    }

    const signup = async (username, password) => {
        const url = "http://localhost:3001/api/auth/signup"
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "username": username, "password": password }),
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        return result;
    }

    const logout = async () => {
        await fetch('http://localhost:3001/api/auth/logout', { 
            method: 'POST', credentials: 'include' 
        });
        setUsername(null);
        token.current = null;
    }

    const apiFetch = useCallback(async (url, options = {}) => {
        if (loading === true) {
            await refresh();
        }
        const send = () => {
            return fetch(url, {
                ...options,
                headers: { ...options.headers, Authorization: `Bearer ${token.current}` },
        })};
        const res = await send();
        if (res.status !== 401) { 
            return res;
        }
        // access token expired; await new token from session
        await refresh();
        if (res.status === 401) { 
            setUsername(null);
            token.current = null;
            return res;
        }
        return send();
    }, [refresh]);

    return (
        <AuthContext.Provider value={{ username, loading, login, logout, signup, apiFetch }}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
