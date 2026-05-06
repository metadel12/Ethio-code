import { apiFetch } from "./api";

const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const login = (payload) =>
  apiFetch("/api/v1/auth/login", { method: "POST", body: JSON.stringify(payload) });

export const register = (payload) =>
  apiFetch("/api/v1/auth/register", { method: "POST", body: JSON.stringify(payload) });

export const getMe = () =>
  apiFetch("/api/v1/users/me");

export const updateMe = (token, payload) =>
  apiFetch("/api/v1/users/me", { method: "PUT", headers: auth(token), body: JSON.stringify(payload) });

export const getSettings = (token) =>
  apiFetch("/api/v1/users/me/settings", { headers: auth(token) });

export const updateSettings = (token, payload) =>
  apiFetch("/api/v1/users/me/settings", { method: "PUT", headers: auth(token), body: JSON.stringify(payload) });

export const logout = (token) =>
  apiFetch("/api/v1/auth/logout", { method: "POST", headers: auth(token) });

export const forgotPassword = (email) =>
  apiFetch("/api/v1/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });

export const resetPassword = (token, new_password) =>
  apiFetch("/api/v1/auth/reset-password", { method: "POST", body: JSON.stringify({ token, new_password }) });

export const verifyEmail = (token) =>
  apiFetch("/api/v1/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) });

export const enable2FA = (token, secret, code) =>
  apiFetch("/api/v1/auth/2fa/enable", { method: "POST", headers: auth(token), body: JSON.stringify({ secret, code }) });

export const verify2FA = (token, code) =>
  apiFetch("/api/v1/auth/2fa/verify", { method: "POST", headers: auth(token), body: JSON.stringify({ code }) });

export const disable2FA = (token, code) =>
  apiFetch("/api/v1/auth/2fa/disable", { method: "POST", headers: auth(token), body: JSON.stringify({ code }) });

export const uploadAvatar = (token, file) => {
  const form = new FormData();
  form.append("file", file);
  return apiFetch("/api/v1/users/me/avatar", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
};
