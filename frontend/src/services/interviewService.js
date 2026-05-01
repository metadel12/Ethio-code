import { apiFetch } from "./api";

export const getInterviews = () => apiFetch("/api/v1/interviews");
