import { createContext, useContext, useState } from "react";

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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

export { useAuth };