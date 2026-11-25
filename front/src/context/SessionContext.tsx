import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest, profileRequest } from "../api/api";
import { ApiError } from "../api/client";

export type User = {
  name: string;
  email: string;
  token: string;
};

type SessionContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(
    () => localStorage.getItem("token") !== null
  );
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let cancelled = false;

    profileRequest()
      .then((profile) => {
        if (cancelled) return;
        setUser({
          name: profile?.name ?? "",
          email: profile?.email ?? "",
          token,
        });
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("token");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function login(user: User) {
    localStorage.setItem("token", user.token);
    setUser(user);
  }

  async function signIn(email: string, password: string) {
    const data = await loginRequest(email, password);
    login({
      name: data.name ?? data.user?.name ?? "",
      email,
      token: data.token,
    });
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  }

  return (
    <SessionContext.Provider value={{ user, loading, signIn, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
