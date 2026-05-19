import { api } from "./api";

const fallbackBase = "http://localhost:8000";

const withFallback = async (path, options = {}) => {
  try {
    return await api[options.method || "get"](path, options.body, options.opts);
  } catch (error) {
    const response = await fetch(`${fallbackBase}${path}`, {
      method: (options.method || "GET").toUpperCase(),
      headers: { "Content-Type": "application/json" },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.detail || "Video chat request failed");
    return data;
  }
};

export const getVideoUser = () => {
  let userId = localStorage.getItem("video_user_id");
  if (!userId) {
    userId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem("video_user_id", userId);
  }
  return {
    user_id: userId,
    user_name: localStorage.getItem("video_user_name") || localStorage.getItem("userName") || "Guest",
    user_email: localStorage.getItem("video_user_email") || "",
  };
};

export const saveVideoUser = ({ user_name, user_email }) => {
  if (user_name) localStorage.setItem("video_user_name", user_name);
  if (user_email) localStorage.setItem("video_user_email", user_email);
  return getVideoUser();
};

export const getWsBase = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  if (apiUrl.startsWith("https://")) return apiUrl.replace("https://", "wss://");
  if (apiUrl.startsWith("http://")) return apiUrl.replace("http://", "ws://");
  if (import.meta.env.DEV) return "ws://localhost:8000";
  return `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
};

export const getWsCandidates = () => {
  const primary = getWsBase();
  const sameOrigin = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
  return Array.from(new Set([primary, sameOrigin, "ws://localhost:8000"]));
};

export const videoChatService = {
  createSession: (body) => withFallback("/api/v1/video-chat/sessions/create", { method: "post", body }),
  getSession: (sessionId) => withFallback(`/api/v1/video-chat/sessions/${sessionId}`),
  joinSession: (sessionId, body) => withFallback(`/api/v1/video-chat/sessions/${sessionId}/join`, { method: "post", body }),
  leaveSession: (sessionId, body) => withFallback(`/api/v1/video-chat/sessions/${sessionId}/leave`, { method: "post", body }),
  saveDeviceTest: (body) => withFallback("/api/v1/video-chat/device-test", { method: "post", body }),
  scheduleInterview: (body) => withFallback("/api/v1/video-chat/interviews/schedule", { method: "post", body }),
};
