import { api } from "@/lib/api/client";
import type {
  AdminUserResponse,
  AdminUsersQuery,
  AdminUsersResponse,
  ResetUserPasswordInput,
  ResetUserPasswordResponse,
  UpdateAdminUserInput,
  UpdateAdminUserResponse,
  UpdateUserStatusResponse,
  CreateUserInput,
  CreatedUser,
} from "./users.types";

export async function updateAdminUser(
  userId: string,
  input: UpdateAdminUserInput,
) {
  const response = await api.patch<UpdateAdminUserResponse>(
    `/admin/users/${userId}`,
    input,
  );

  return response.data;
}

export async function getAdminUsers(query: AdminUsersQuery) {
  const response = await api.get<AdminUsersResponse>("/admin/users", {
    params: {
      page: query.page,
      limit: query.limit,
      search: query.search || undefined,
      role: query.role || undefined,
    },
  });

  return response.data;
}

export async function getAdminUser(userId: string) {
  const response = await api.get<AdminUserResponse>(`/admin/users/${userId}`);

  return response.data;
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  const response = await api.patch<UpdateUserStatusResponse>(
    `/admin/users/${userId}/status`,
    {
      isActive,
    },
  );

  return response.data;
}
export async function resetUserPassword(
  userId: string,
  input: ResetUserPasswordInput,
) {
  const response = await api.patch<ResetUserPasswordResponse>(
    `/admin/users/${userId}/reset-password`,
    input,
  );

  return response.data;
}

export async function createUser(input: CreateUserInput) {
  const response = await api.post<CreatedUser>("/users", input);

  return response.data;
}
