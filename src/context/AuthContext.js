"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const tokenRef = useRef(null);

  useEffect(() => {
    const t = localStorage.getItem("hp_token");
    if (t) {
      tokenRef.current = t;
      setToken(t);
    }
    setReady(true);
  }, []);

  const refresh = useCallback(async (t) => {
    const tok = t || tokenRef.current;
    if (!tok) return null;
    try {
      const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${tok}` } });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      }
    } catch {}
    return null;
  }, []);

  // Only fetch user once on mount when token exists
  const didFetch = useRef(false);
  useEffect(() => {
    if (token && !didFetch.current) {
      didFetch.current = true;
      refresh(token);
    }
  }, [token, refresh]);

  const login = useCallback((t, u) => {
    localStorage.setItem("hp_token", t);
    tokenRef.current = t;
    setToken(t);
    setUser(u);
    didFetch.current = true; // user already provided, skip fetch
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hp_token");
    tokenRef.current = null;
    setToken(null);
    setUser(null);
    didFetch.current = false;
    router.push("/login");
  }, [router]);

  const authFetch = useCallback(
    (url, opts = {}) =>
      fetch(url, {
        ...opts,
        headers: {
          "Content-Type": "application/json",
          ...(opts.headers || {}),
          ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
        },
      }),
    []
  );

  const value = useMemo(
    () => ({ token, user, ready, login, logout, refresh, authFetch }),
    [token, user, ready, login, logout, refresh, authFetch]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
