import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: rawBaseUrl
    ? rawBaseUrl.endsWith("/api/v1")
      ? rawBaseUrl
      : `${rawBaseUrl}/api/v1`
    : "/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchStats = () => api.get("/home/stats");
export const fetchActivityFeed = () => api.get("/home/activity-feed");
export const fetchSuccessStories = () => api.get("/home/success-stories");
export const fetchJobs = () => api.get("/home/jobs");
export const fetchLeaderboard = () => api.get("/home/leaderboard");
export const fetchPartners = () => api.get("/home/partners");
export const fetchLearningPaths = () => api.get("/home/learning-paths");
export const fetchFeaturedBlogs = () => api.get("/home/blogs/featured");
export const fetchUpcomingEvents = () => api.get("/home/events/upcoming");
export const fetchDailyChallenge = () => api.get("/home/daily-challenge");
export const fetchTechnologies = () => api.get("/home/technologies");
export const fetchCommunityStats = () => api.get("/home/community-stats");
export const fetchPricing = () => api.get("/home/pricing");
export const fetchFAQs = () => api.get("/home/faqs");
export const fetchTestimonials = () => api.get("/home/testimonials");
export const subscribeNewsletter = (email) => api.post("/home/newsletter/subscribe", { email });
export const submitQuiz = (answers) => api.post("/home/quiz/submit", { answers });
export const reviewCode = (code, language) => api.post("/home/code/review", { code, language });

export default api;
