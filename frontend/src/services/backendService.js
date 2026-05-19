import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`
  : '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const fallbackApi = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const withFallback = async (primaryRequest, fallbackRequest) => {
  try {
    const response = await primaryRequest(api);
    return response.data;
  } catch (error) {
    const response = await fallbackRequest(fallbackApi);
    return response.data;
  }
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const backendService = {
  // Questions
  getQuestions: async (params = {}) => {
    return withFallback(
      (client) => client.get('/backend-interview/questions', { params }),
      (client) => client.get('/backend-interview/questions', { params })
    );
  },

  getQuestion: async (questionId) => {
    return withFallback(
      (client) => client.get(`/backend-interview/questions/${questionId}`),
      (client) => client.get(`/backend-interview/questions/${questionId}`)
    );
  },

  getCategories: async () => {
    return withFallback(
      (client) => client.get('/backend-interview/categories'),
      (client) => client.get('/backend-interview/categories')
    );
  },

  // Attempts
  submitAnswer: async (questionId, attemptData) => {
    const response = await api.post(`/backend-interview/questions/${questionId}/attempt`, attemptData);
    return response.data;
  },

  submitPracticeAttempt: async (attemptData) => {
    return withFallback(
      (client) => client.post('/backend-interview/practice-attempts', attemptData),
      (client) => client.post('/backend-interview/practice-attempts', attemptData)
    );
  },

  getPracticeResults: async (params = {}) => {
    return withFallback(
      (client) => client.get('/backend-interview/practice-results', { params }),
      (client) => client.get('/backend-interview/practice-results', { params })
    );
  },

  // Statistics
  getStatistics: async () => {
    return withFallback(
      (client) => client.get('/backend-interview/statistics'),
      (client) => client.get('/backend-interview/statistics')
    );
  },

  // Code Execution
  executeCode: async (codeData) => {
    const response = await api.post('/code-execution/run', codeData);
    return response.data;
  },

  // AI Feedback
  getAIFeedback: async (feedbackData) => {
    const response = await api.post('/ai-feedback/evaluate', feedbackData);
    return response.data;
  },

  // System Design
  getSystemDesignScenarios: async (params = {}) => {
    return withFallback(
      (client) => client.get('/backend-interview/system-design', { params }),
      (client) => client.get('/backend-interview/system-design', { params })
    );
  },

  // Ethiopian Companies
  getEthiopianCompanies: async () => {
    return withFallback(
      (client) => client.get('/backend-interview/ethiopian/companies'),
      (client) => client.get('/backend-interview/ethiopian/companies')
    );
  },

  getEthiopianQuestions: async (companyId = null) => {
    const params = companyId ? { company_id: companyId } : {};
    return withFallback(
      (client) => client.get('/backend-interview/ethiopian/questions', { params }),
      (client) => client.get('/backend-interview/ethiopian/questions', { params })
    );
  },

  // Remote Jobs
  getRemoteJobQuestions: async () => {
    return withFallback(
      (client) => client.get('/backend-interview/remote/questions'),
      (client) => client.get('/backend-interview/remote/questions')
    );
  },

  // Leaderboard
  getLeaderboard: async (limit = 50) => {
    return withFallback(
      (client) => client.get('/backend-interview/leaderboard', { params: { limit } }),
      (client) => client.get('/backend-interview/leaderboard', { params: { limit } })
    );
  },
};

export default api;
