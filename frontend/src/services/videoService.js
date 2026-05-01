import { apiFetch } from "./api";

export const getMeetings = () => apiFetch("/api/v1/video/meetings");
