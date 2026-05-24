import { createContext, useContext, useState, useEffect } from "react";
import { apiGetMe } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("sh_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem("sh_user", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("sh_token", token);
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("sh_user");
    localStorage.removeItem("sh_token");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("sh_token");
    if (!token) return;

    let mounted = true;
    apiGetMe()
      .then((fresh) => {
        if (!mounted) return;
        setUser(fresh);
        localStorage.setItem("sh_user", JSON.stringify(fresh));
      })
      .catch((err) => {
        const status = err?.status || err?.status_code || err?.statusCode;
        if (status === 401 || status === 403) {
          localStorage.removeItem("sh_user");
          localStorage.removeItem("sh_token");
          setUser(null);
        } else {
          console.error("Failed to refresh user on mount:", err);
        }
      });

    return () => { mounted = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

export { useAuth };