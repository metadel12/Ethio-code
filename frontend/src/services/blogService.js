import { apiFetch } from "./api";

export const getBlogs = () => apiFetch("/api/v1/blogs");
