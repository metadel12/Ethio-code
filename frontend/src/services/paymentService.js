import { apiFetch } from "./api";

export const createPayment = (payload) =>
  apiFetch("/api/v1/payments", { method: "POST", body: JSON.stringify(payload) });
