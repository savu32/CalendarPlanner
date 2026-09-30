
export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('localhost:3001/api/me', { credentials: 'include' })
            .then(res => (res.ok ? res.json() : null))
            .then(setUser)
            .finally(() => setLoading(false));
            }, []);
        const url = `http://localhost:3001/api/me`;
        try {
            const response = fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // "headers": { Authorization: `Bearer ${token}` }
                },
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const result = response.json();
            updateNotes(result);
        } catch (error) {
            console.error(error.message);
        }

    async function login(email, password) {
        const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Login failed');
        setUser(await res.json());
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
