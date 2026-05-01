import { createContext, useEffect, useMemo, useState } from "react";

import * as authService from "../services/authService";

export const AuthContext = createContext(null);

const STORAGE_KEY = "ethiocode.auth";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.getMe(token);
        if (!cancelled) setUser(profile);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const signIn = async (credentials) => {
    const result = await authService.login(credentials);
    localStorage.setItem(STORAGE_KEY, result.access_token);
    setToken(result.access_token);
    setUser(result.user);
    return result.user;
  };

  const signUp = async ({ name, email, password, role, company_name, company_registration, company_website, company_description, company_size }) => {
    const result = await authService.register({
      full_name: name,
      email,
      password,
      role: role ?? "job_seeker",
      company_name,
      company_registration,
      company_website,
      company_description,
      company_size,
    });
    localStorage.setItem(STORAGE_KEY, result.access_token);
    setToken(result.access_token);
    setUser(result.user);
    return result.user;
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, signIn, signUp, signOut, isAuthenticated: Boolean(user) }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
