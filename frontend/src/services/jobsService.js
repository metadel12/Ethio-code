import { apiFetch } from "./api";

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("ethiocode.auth")}` });

export const getPublicJobs = () => apiFetch("/api/v1/jobs/public");
export const getJobStats = () => apiFetch("/api/v1/jobs/stats");

export const listJobs = (params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== "")).toString();
  return apiFetch(`/api/v1/jobs${q ? `?${q}` : ""}`, { headers: auth() });
};

export const getJob = (id) => apiFetch(`/api/v1/jobs/${id}`, { headers: auth() });

export const applyForJob = (id, payload) =>
  apiFetch(`/api/v1/jobs/${id}/apply`, { method: "POST", body: JSON.stringify(payload), headers: auth() });

export const saveJob = (id) =>
  apiFetch(`/api/v1/jobs/${id}/save`, { method: "POST", headers: auth() });

export const unsaveJob = (id) =>
  apiFetch(`/api/v1/jobs/${id}/save`, { method: "DELETE", headers: auth() });

export const getSavedJobs = () => apiFetch("/api/v1/jobs/saved", { headers: auth() });

export const getMyApplications = () => apiFetch("/api/v1/jobs/applications", { headers: auth() });

export const withdrawApplication = (id) =>
  apiFetch(`/api/v1/jobs/applications/${id}`, { method: "DELETE", headers: auth() });

export const getAlerts = () => apiFetch("/api/v1/jobs/alerts", { headers: auth() });
export const createAlert = (payload) =>
  apiFetch("/api/v1/jobs/alerts", { method: "POST", body: JSON.stringify(payload), headers: auth() });
export const deleteAlert = (id) =>
  apiFetch(`/api/v1/jobs/alerts/${id}`, { method: "DELETE", headers: auth() });

// Company
export const postJob = (payload) =>
  apiFetch("/api/v1/jobs", { method: "POST", body: JSON.stringify(payload), headers: auth() });
export const updateJob = (id, payload) =>
  apiFetch(`/api/v1/jobs/${id}`, { method: "PUT", body: JSON.stringify(payload), headers: auth() });
export const deleteJob = (id) =>
  apiFetch(`/api/v1/jobs/${id}`, { method: "DELETE", headers: auth() });
export const getCompanyJobs = () => apiFetch("/api/v1/jobs/company/mine", { headers: auth() });
export const getJobApplications = (jobId) =>
  apiFetch(`/api/v1/jobs/${jobId}/applications`, { headers: auth() });
export const updateApplicationStatus = (appId, status) =>
  apiFetch(`/api/v1/jobs/applications/${appId}/status`, { method: "PUT", body: JSON.stringify({ status }), headers: auth() });

// Admin
export const adminGetUsers = () => apiFetch("/api/v1/jobs/admin/users", { headers: auth() });
export const adminGetStats = () => apiFetch("/api/v1/jobs/admin/stats", { headers: auth() });
export const adminPendingCompanies = () => apiFetch("/api/v1/jobs/admin/companies/pending", { headers: auth() });
export const adminVerifyCompany = (id, status) =>
  apiFetch(`/api/v1/jobs/admin/companies/${id}/verify`, { method: "PUT", body: JSON.stringify({ status }), headers: auth() });
export const adminFeatureJob = (id) =>
  apiFetch(`/api/v1/jobs/admin/jobs/${id}/feature`, { method: "PUT", headers: auth() });
