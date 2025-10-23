import React, { createContext, useContext, useState, useEffect, useRef } from "react";
// <-- import your axios instance here (adjust path if needed)
import api from "../../api/axios";
type User = { email?: string; name?: string; id?: number; role?: string } | null;
type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUserFromToken: () => Promise<User | null>;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// relative endpoints — axios instance baseURL must be provided by the caller
const ENDPOINTS = {
  login: "/auth/login",
  me: "/auth/login",
};
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastTokenRef = useRef<string | null>(localStorage.getItem("token"));
  const logout = () => {
    try {
      localStorage.removeItem("token");
      console.info("[auth] logged out, token removed");
    } catch (e) {
      console.warn("[auth] remove token failed", e);
    }
    lastTokenRef.current = null;
    setUser(null);
  };
  const authHeaders = (token: string | null) => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };
  // On mount: validate token with /me
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        lastTokenRef.current = token;
        if (!token) {
          console.info("[auth] no token on mount");
          logout();
          return;
        }
        console.info("[auth] validating token with /me");
        // use axios instance
        const res = await api.get(ENDPOINTS.me, { headers: authHeaders(token) });
        console.log("[auth] /me raw response:", res);
        const body = res?.data ?? null;
        console.debug("[auth] /me body:", body);
        const serverUser = body?.user ?? body?.admin ?? null;
        if (serverUser) {
          setUser({
            email: serverUser.email,
            name: serverUser.name,
            id: serverUser.id,
            role: serverUser.role,
          });
        } else {
          console.warn("[auth] /me returned no user");
          logout();
        }
      } catch (err: any) {
        // axios error shape preserved
        console.error("[auth] error verifying token on mount:", err);
        logout();
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Storage event (other tab)
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "token") {
        const newToken = ev.newValue;
        console.info("[auth] storage.token changed", newToken);
        lastTokenRef.current = newToken;
        if (!newToken) {
          logout();
        } else {
          (async () => {
            setIsLoading(true);
            try {
              const res = await api.get(ENDPOINTS.me, { headers: authHeaders(newToken) });
              console.log("[auth] /me (storage) response:", res);
              const body = res?.data ?? null;
              const serverUser = body?.user ?? body?.admin ?? null;
              if (serverUser) {
                setUser({
                  email: serverUser.email,
                  name: serverUser.name,
                  id: serverUser.id,
                  role: serverUser.role,
                });
              } else {
                logout();
              }
            } catch (err) {
              console.error("[auth] storage refresh error:", err);
              logout();
            } finally {
              setIsLoading(false);
            }
          })();
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Polling fallback
  useEffect(() => {
    let intervalId: number | null = null;
    const start = () => {
      if (intervalId != null) return;
      intervalId = window.setInterval(() => {
        try {
          const current = localStorage.getItem("token");
          if (lastTokenRef.current && !current) {
            console.info("[auth] token removed via polling -> logout");
            lastTokenRef.current = null;
            logout();
          } else {
            lastTokenRef.current = current;
          }
        } catch (e) {
          console.warn("[auth] polling read failed", e);
        }
      }, 1000);
    };
    const stop = () => {
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    if (user) start();
    return () => stop();
  }, [user]);
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      console.info("[auth] POST", ENDPOINTS.login, { email });
      // use axios for login
      const res = await api.post(
        ENDPOINTS.login,
        { email, password },
        {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        }
      );

      console.log("[auth] raw login response:", res);
      const parsed = res?.data ?? null;
      console.debug("[auth] parsed login body:", parsed);

      // preserve previous tolerant token extraction
      if (!res || (res.status && res.status >= 400)) {
        const message = parsed?.message ?? parsed?.error ?? `Login failed (${res?.status})`;
        console.warn("[auth] login failed:", message);
        throw new Error(message);
      }

      const token = parsed?.accessToken ?? parsed?.token ?? parsed?.access_token ?? null;
      if (!token) {
        console.warn("[auth] no token in login response", parsed);
        throw new Error("No token received from server");
      }

      try {
        localStorage.setItem("token", token);
        lastTokenRef.current = token;
      } catch (err) {
        console.warn("[auth] saving token failed", err);
      }

      const serverUser = parsed?.admin ?? parsed?.user ?? null;
      const newUser: User = serverUser
        ? {
            email: serverUser.email,
            name: serverUser.name,
            id: serverUser.id,
            role: serverUser.role,
          }
        : { email };

      setUser(newUser);
      console.info("[auth] login successful");
      return newUser;
    } catch (err) {
      console.error("[auth] login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserFromToken = async (): Promise<User | null> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        logout();
        return null;
      }
      try {
        const res = await api.get(ENDPOINTS.me, { headers: authHeaders(token) });
        console.log("[auth] refresh /me response:", res);
        if (!res || (res.status && res.status >= 400)) {
          logout();
          return null;
        }
        const body = res?.data ?? null;
        const serverUser = body?.user ?? body?.admin ?? null;
        if (serverUser) {
          const refreshed: User = {
            email: serverUser.email,
            name: serverUser.name,
            id: serverUser.id,
            role: serverUser.role,
          };
          setUser(refreshed);
          return refreshed;
        } else {
          logout();
          return null;
        }
      } catch (err) {
        console.error("[auth] refresh error:", err);
        logout();
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUserFromToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
