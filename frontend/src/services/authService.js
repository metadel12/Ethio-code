import { apiFetch } from "./api";

export const login = (payload) =>
  apiFetch("/api/v1/auth/login", { method: "POST", body: JSON.stringify(payload) });

export const register = (payload) =>
  apiFetch("/api/v1/auth/register", { method: "POST", body: JSON.stringify(payload) });

export const getMe = (token) =>
  apiFetch("/api/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
