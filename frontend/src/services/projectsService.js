import { apiFetch } from "./api";

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });

export const listProjects = (params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== "")).toString();
  return apiFetch(`/api/v1/projects${q ? `?${q}` : ""}`);
};

export const getProject = (id) => apiFetch(`/api/v1/projects/${id}`);
export const getStats = () => apiFetch("/api/v1/projects/stats");
export const getFilterOptions = () => apiFetch("/api/v1/projects/filter-options");
export const getFeatured = () => apiFetch("/api/v1/projects/featured");

export const createProject = (payload) =>
  apiFetch("/api/v1/projects", { method: "POST", body: JSON.stringify(payload), headers: auth() });

export const updateProject = (id, payload) =>
  apiFetch(`/api/v1/projects/${id}`, { method: "PUT", body: JSON.stringify(payload), headers: auth() });

export const deleteProject = (id) =>
  apiFetch(`/api/v1/projects/${id}`, { method: "DELETE", headers: auth() });

export const getMyProjects = () => apiFetch("/api/v1/projects/user/mine", { headers: auth() });
export const getSavedProjects = () => apiFetch("/api/v1/projects/user/saved", { headers: auth() });

export const likeProject = (id) =>
  apiFetch(`/api/v1/projects/${id}/like`, { method: "POST", headers: auth() });

export const saveProject = (id) =>
  apiFetch(`/api/v1/projects/${id}/save`, { method: "POST", headers: auth() });

export const addComment = (id, comment) =>
  apiFetch(`/api/v1/projects/${id}/comment`, { method: "POST", body: JSON.stringify({ comment }), headers: auth() });
