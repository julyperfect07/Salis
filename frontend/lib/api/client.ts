import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined;

    const isAuthRequest =
      request?.url?.includes("/auth/login") ||
      request?.url?.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        undefined,
        { withCredentials: true },
      );

      return api.request(request);
    } catch {
      return Promise.reject(error);
    }
  },
);
