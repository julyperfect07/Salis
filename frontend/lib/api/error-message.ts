import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<{ message?: string | string[] }>(error)) return fallback;
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(", ") : message || fallback;
}
