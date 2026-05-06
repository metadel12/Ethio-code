import { createContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

const STORAGE_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "ethiocode.user";

function parseTokenUser(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch { return null; }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || localStorage.getItem("ethiocode.auth"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setUser(null); return; }
    // If we already have user in state, skip the fetch
    if (user) return;
    setLoading(true);
    authService.getMe(token)
      .then(profile => { setUser(profile); localStorage.setItem(USER_KEY, JSON.stringify(profile)); })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("ethiocode.auth");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const signIn = async (credentials) => {
    const result = await authService.login(credentials);
    localStorage.setItem(STORAGE_KEY, result.access_token);
    if (result.refresh_token) localStorage.setItem(REFRESH_KEY, result.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setToken(result.access_token);
    setUser(result.user);
    return result.user;
  };

  const signUp = async ({ name, email, password, role, company_name, company_registration, company_website, company_description, company_size }) => {
    const result = await authService.register({
      full_name: name, email, password,
      role: role ?? "job_seeker",
      company_name, company_registration, company_website, company_description, company_size,
    });
    localStorage.setItem(STORAGE_KEY, result.access_token);
    if (result.refresh_token) localStorage.setItem(REFRESH_KEY, result.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setToken(result.access_token);
    setUser(result.user);
    return result.user;
  };

  const signOut = () => {
    authService.logout(token).catch(() => {});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("ethiocode.auth");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, signIn, signUp, signOut, isAuthenticated: Boolean(user) }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
