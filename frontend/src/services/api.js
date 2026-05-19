export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(data?.detail ?? data ?? "Request failed");
  }

  return data;
};
