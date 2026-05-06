import { apiFetch } from "./api";

const BASE_URL = "/api/v1/templates";

const authHeaders = () => {
  const token = localStorage.getItem("ethiocode.auth");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const templateService = {
  async listTemplates(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${BASE_URL}?${qs}`);
  },

  async searchTemplates(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${BASE_URL}/search?${qs}`);
  },

  async getTemplate(id) {
    return apiFetch(`${BASE_URL}/${id}`);
  },

  async getCategories() {
    return apiFetch(`${BASE_URL}/categories`);
  },

  async createTemplate(data) {
    return apiFetch(BASE_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
  },

  async updateTemplate(id, data) {
    return apiFetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
  },

  async deleteTemplate(id) {
    return apiFetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  async uploadFiles(id, formData) {
    return apiFetch(`${BASE_URL}/${id}/upload`, {
      method: "POST",
      headers: { "Content-Type": null, ...authHeaders() },
      body: formData,
    });
  },

  async submitForReview(id) {
    return apiFetch(`${BASE_URL}/${id}/submit`, {
      method: "POST",
      headers: authHeaders(),
    });
  },

  async getMyTemplates() {
    return apiFetch(`${BASE_URL}/my/templates`, {
      headers: authHeaders(),
    });
  },

  async getCreatorDashboard() {
    return apiFetch(`${BASE_URL}/creator/dashboard`, {
      headers: authHeaders(),
    });
  },

  async getPendingTemplates() {
    return apiFetch(`${BASE_URL}/admin/pending`, {
      headers: authHeaders(),
    });
  },

  async approveTemplate(id) {
    return apiFetch(`${BASE_URL}/${id}/approve`, {
      method: "POST",
      headers: authHeaders(),
    });
  },

  async rejectTemplate(id, reason) {
    return apiFetch(`${BASE_URL}/${id}/reject`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ reason }),
    });
  },

  async getReviews(id) {
    return apiFetch(`${BASE_URL}/${id}/reviews`);
  },

  async createReview(id, data) {
    return apiFetch(`${BASE_URL}/${id}/reviews`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
  },

  async saveTemplate(id) {
    return apiFetch(`${BASE_URL}/${id}/save`, {
      method: "POST",
      headers: authHeaders(),
    });
  },

  async unsaveTemplate(id) {
    return apiFetch(`${BASE_URL}/${id}/save`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  async getSavedTemplates() {
    return apiFetch(`${BASE_URL}/saved/list`, {
      headers: authHeaders(),
    });
  },
};