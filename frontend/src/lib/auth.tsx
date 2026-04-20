"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  hospital_id: string | null;
  hospital_name: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ role: string; hospital_id: string | null }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (t: string) => {
    try {
      const profile = await api.getProfile(t);
      setUser(profile);
    } catch {
      localStorage.removeItem("medchain_token");
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("medchain_token");
    if (stored) {
      setToken(stored);
      loadUser(stored).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem("medchain_token", res.access_token);
    setToken(res.access_token);
    await loadUser(res.access_token);
    return { role: res.role, hospital_id: res.hospital_id };
  };

  const logout = () => {
    localStorage.removeItem("medchain_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
