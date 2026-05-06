export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

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
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refresh}`, "Content-Type": "application/json" },
    });
    if (!res.ok) { clearTokens(); throw new Error("Session expired"); }
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  })().finally(() => { _refreshPromise = null; });
  return _refreshPromise;
}

// ── Core fetch ────────────────────────────────────────────────────────────────
const buildHeaders = (raw = {}, withAuth = true) => {
  const h = { ...raw };
  if (!("Content-Type" in h)) h["Content-Type"] = "application/json";
  if (h["Content-Type"] === null) delete h["Content-Type"];
  if (withAuth) {
    const token = getToken();
    if (token) h["Authorization"] = `Bearer ${token}`;
  }
  // CSRF double-submit for mutations
  const csrf = getCsrfToken();
  if (csrf) h["X-CSRF-Token"] = csrf;
  return h;
};

export const apiFetch = async (path, options = {}, _retry = true) => {
  const t0 = performance.now();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options?.headers),
  });

  // Auto-refresh on 401
  if (res.status === 401 && _retry) {
    try {
      await refreshAccessToken();
      return apiFetch(path, options, false);
    } catch {
      clearTokens();
      window.dispatchEvent(new Event("auth:logout"));
      throw new Error("Session expired. Please log in again.");
    }
  }

  const ct = res.headers.get("content-type") ?? "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) throw new Error(data?.detail ?? data ?? "Request failed");

  // Performance logging in dev
  if (import.meta.env.DEV) {
    const ms = Math.round(performance.now() - t0);
    if (ms > 150) console.warn(`[API] Slow response: ${path} took ${ms}ms`);
  }

  return data;
};

// ── Convenience methods ───────────────────────────────────────────────────────
export const api = {
  get:    (path, opts) => apiFetch(path, { method: "GET", ...opts }),
  post:   (path, body, opts) => apiFetch(path, { method: "POST", body: JSON.stringify(body), ...opts }),
  put:    (path, body, opts) => apiFetch(path, { method: "PUT", body: JSON.stringify(body), ...opts }),
  patch:  (path, body, opts) => apiFetch(path, { method: "PATCH", body: JSON.stringify(body), ...opts }),
  delete: (path, opts) => apiFetch(path, { method: "DELETE", ...opts }),
};

export default api;
