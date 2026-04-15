"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("hp_token");
    if (t) setToken(t);
    setReady(true);
  }, []);

  const refresh = useCallback(async (t = token) => {
    if (!t) return null;
    const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${t}` } });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      return data.user;
    }
    return null;
  }, [token]);

  useEffect(() => {
    if (token) refresh(token);
  }, [token, refresh]);

  const login = (t, u) => {
    localStorage.setItem("hp_token", t);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("hp_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const authFetch = useCallback(
    (url, opts = {}) =>
      fetch(url, {
        ...opts,
        headers: {
          "Content-Type": "application/json",
          ...(opts.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }),
    [token]
  );

  return (
    <Ctx.Provider value={{ token, user, ready, login, logout, refresh, authFetch }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
