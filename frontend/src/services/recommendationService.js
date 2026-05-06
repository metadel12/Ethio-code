import api from "./api";

const BASE = "/ai/recommendations";

export const recommendationService = {
  getCourses:    (limit = 10) => api.post(`${BASE}/courses`,    { limit }),
  getChallenges: (limit = 10) => api.post(`${BASE}/challenges`, { limit }),
  getJobs:       (limit = 10) => api.post(`${BASE}/jobs`,       { limit }),
  getTemplates:  (limit = 10) => api.post(`${BASE}/templates`,  { limit }),
  getMentors:    (limit = 10) => api.post(`${BASE}/mentors`,    { limit }),
  sendFeedback:  (item_id, clicked) => api.post(`${BASE}/feedback`, { item_id, clicked }),
};
