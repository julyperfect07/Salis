import { api } from "@/lib/api/client";
import type { AuthUser, LoginResponse } from "@/types/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials) {
  const response = await api.post<LoginResponse>("/auth/login", credentials);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<{ message: string; user: AuthUser }>(
    "/users/me",
  );
  return response.data.user;
}

export async function logout() {
  const response = await api.post<{ message: string }>("/auth/logout");
  return response.data;
}
