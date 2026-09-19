import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | in | out

  const load = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setOrg(data.organization);
      setStatus("in");
    } catch {
      setUser(null); setOrg(null); setStatus("out");
    }
  };

  useEffect(() => { load(); }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.access_token) localStorage.setItem("access_token", data.access_token);
    await load();
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    if (data.access_token) localStorage.setItem("access_token", data.access_token);
    await load();
    return data;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("access_token");
    setUser(null); setOrg(null); setStatus("out");
  };

  return (
    <AuthCtx.Provider value={{ user, org, status, login, register, logout, refresh: load }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
