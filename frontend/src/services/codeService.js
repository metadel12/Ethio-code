import { apiFetch } from "./api";

export const runCode = (payload) =>
  apiFetch("/api/v1/code/run", { method: "POST", body: JSON.stringify(payload) });
