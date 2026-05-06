import { apiFetch } from "./api";

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("ethiocode.auth")}` });

export const getDashboardStats = () => apiFetch("/api/v1/dashboard/stats", { headers: auth() });
export const getActivities = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/api/v1/dashboard/activities${q ? `?${q}` : ""}`, { headers: auth() });
};
export const getLearningProgress = () => apiFetch("/api/v1/dashboard/learning/progress", { headers: auth() });
export const getProjects = () => apiFetch("/api/v1/dashboard/projects", { headers: auth() });
export const getAchievements = () => apiFetch("/api/v1/dashboard/achievements", { headers: auth() });
export const getSavedItems = (type) => apiFetch(`/api/v1/dashboard/saved-items${type ? `?item_type=${type}` : ""}`, { headers: auth() });
export const getJobApplicationsSummary = () => apiFetch("/api/v1/dashboard/job-applications", { headers: auth() });
export const getAnalytics = (period = "30d") => apiFetch(`/api/v1/dashboard/analytics?period=${period}`, { headers: auth() });
export const getRecommendations = () => apiFetch("/api/v1/dashboard/recommendations", { headers: auth() });
export const getDeadlines = () => apiFetch("/api/v1/dashboard/deadlines", { headers: auth() });
