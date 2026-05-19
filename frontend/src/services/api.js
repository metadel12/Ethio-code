// src/services/api.js

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://ethio-code-backend.onrender.com/";
ht
// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");

export const setTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// ── CSRF cookie reader ────────────────────────────────────────────────────────
const getCsrfToken = () =>
  document.cookie.split("; ").find((r) => r.startsWith("csrf_token="))?.split("=")[1] ?? "";

// ── Refresh lock (prevent parallel refresh races) ────────────────────────────
let _refreshPromise = null;

async function refreshAccessToken() {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refresh}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        clearTokens();
        throw new Error("Session expired");
      }

      const data = await response.json();
      setTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } catch (error) {
      clearTokens();
      throw error;
    }
  })().finally(() => {
    _refreshPromise = null;
  });

  return _refreshPromise;
}

// ── Core fetch ────────────────────────────────────────────────────────────────
const buildHeaders = (raw = {}, withAuth = true) => {
  const headers = { ...raw };

  // Set default Content-Type if not specified
  if (!headers["Content-Type"] && !(headers["Content-Type"] === null)) {
    headers["Content-Type"] = "application/json";
  }

  // Remove Content-Type if explicitly set to null
  if (headers["Content-Type"] === null) {
    delete headers["Content-Type"];
  }

  // Add Authorization token if required
  if (withAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // CSRF double-submit for mutations (POST, PUT, PATCH, DELETE)
  const csrf = getCsrfToken();
  if (csrf && ["POST", "PUT", "PATCH", "DELETE"].includes(raw.method || "")) {
    headers["X-CSRF-Token"] = csrf;
  }

  return headers;
};

// ── Main API fetch function ───────────────────────────────────────────────────
export const apiFetch = async (path, options = {}, _retry = true) => {
  const t0 = performance.now();

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(options?.headers, options?.withAuth !== false),
    });

    // Auto-refresh on 401 (Unauthorized)
    if (response.status === 401 && _retry) {
      try {
        await refreshAccessToken();
        // Retry the original request with new token
        return apiFetch(path, options, false);
      } catch (refreshError) {
        clearTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        throw new Error("Session expired. Please log in again.");
      }
    }

    // Parse response based on content type
    const contentType = response.headers.get("content-type") ?? "";
    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else if (contentType.includes("text/")) {
      data = await response.text();
    } else {
      data = await response.blob();
    }

    // Throw error for non-OK responses
    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || data || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    // Performance logging in development
    if (import.meta.env.DEV) {
      const elapsedMs = Math.round(performance.now() - t0);
      if (elapsedMs > 150) {
        console.warn(`[API] Slow response: ${path} took ${elapsedMs}ms`);
      }
    }

    return data;

  } catch (error) {
    // Handle network errors
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error("Network error: Unable to connect to server. Please check your connection.");
    }
    throw error;
  }
};

// ── Convenience methods ───────────────────────────────────────────────────────
export const api = {
  get: (path, options) => apiFetch(path, { method: "GET", ...options }),

  post: (path, body, options) => apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options
  }),

  put: (path, body, options) => apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options
  }),

  patch: (path, body, options) => apiFetch(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options
  }),

  delete: (path, options) => apiFetch(path, { method: "DELETE", ...options }),

  // Form data upload (for files)
  upload: (path, formData, options) => {
    return apiFetch(path, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": null }, // Let browser set multipart boundary
      ...options
    });
  },
};

// ── DEVICE TEST API (specific endpoints) ─────────────────────────────────────
export const deviceTestAPI = {
  // Save test results
  saveResults: (data) => api.post("/api/v1/device-test/results", data),

  // Get latest test results
  getLatestResults: () => api.get("/api/v1/device-test/results/latest"),

  // Get test history
  getHistory: (limit = 10) => api.get(`/api/v1/device-test/results/history?limit=${limit}`),

  // Test network speed
  testNetworkSpeed: () => api.get("/api/v1/device-test/network-speed"),

  // Save device settings
  saveSettings: (settings) => api.post("/api/v1/device-test/settings", settings),

  // Get device settings
  getSettings: () => api.get("/api/v1/device-test/settings"),
};

// ── AUTH API (optional convenience) ──────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post("/api/v1/auth/login", { email, password }),
  register: (userData) => api.post("/api/v1/auth/register", userData),
  logout: () => api.post("/api/v1/auth/logout"),
  refresh: () => api.post("/api/v1/auth/refresh"),
  forgotPassword: (email) => api.post("/api/v1/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) => api.post("/api/v1/auth/reset-password", { token, new_password: newPassword }),
  verifyEmail: (token) => api.post("/api/v1/auth/verify-email", { token }),
};

// ── JOBS API ──────────────────────────────────────────────────────────────────
export const jobsAPI = {
  getAllJobs: (params) => api.get("/api/v1/jobs", { params }),
  getJobById: (id) => api.get(`/api/v1/jobs/${id}`),
  postJob: (jobData) => api.post("/api/v1/jobs", jobData),
  updateJob: (id, jobData) => api.put(`/api/v1/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/api/v1/jobs/${id}`),
  applyForJob: (id, applicationData) => api.post(`/api/v1/jobs/${id}/apply`, applicationData),
  getMyApplications: () => api.get("/api/v1/jobs/applications"),
  saveJob: (id) => api.post(`/api/v1/jobs/${id}/save`),
  unsaveJob: (id) => api.delete(`/api/v1/jobs/${id}/save`),
  getSavedJobs: () => api.get("/api/v1/jobs/saved"),
};

// ── PROJECTS API ──────────────────────────────────────────────────────────────
export const projectsAPI = {
  getAllProjects: (params) => api.get("/api/v1/projects", { params }),
  getProjectById: (id) => api.get(`/api/v1/projects/${id}`),
  createProject: (projectData) => api.post("/api/v1/projects", projectData),
  updateProject: (id, projectData) => api.put(`/api/v1/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/api/v1/projects/${id}`),
  likeProject: (id) => api.post(`/api/v1/projects/${id}/like`),
  saveProject: (id) => api.post(`/api/v1/projects/${id}/save`),
  getMyProjects: () => api.get("/api/v1/projects/user/projects"),
};

// ── INTERVIEWS API ────────────────────────────────────────────────────────────
export const interviewsAPI = {
  getQuestions: (params) => api.get("/api/v1/backend-interview/questions", { params }),
  getCategories: () => api.get("/api/v1/backend-interview/categories"),
  submitAnswer: (questionId, answerData) => api.post(`/api/v1/backend-interview/questions/${questionId}/attempt`, answerData),
  getProgress: () => api.get("/api/v1/backend-interview/progress"),
  getLeaderboard: () => api.get("/api/v1/backend-interview/leaderboard"),
  runCode: (code, language) => api.post("/api/v1/code-execution/run", { code, language }),
  getAIFeedback: (questionText, userAnswer) => api.post("/api/v1/ai-feedback/evaluate", { question_text: questionText, user_answer: userAnswer }),
};

// ── DEFAULT EXPORT ────────────────────────────────────────────────────────────
export default api;