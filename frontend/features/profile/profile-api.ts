import { api } from "@/lib/api/client";
import type { AdminUser, AdminUserDetails, DeliveryCompanyDetails, DeliveryZone } from "@/features/admin/users.types";

export async function getProfile() {
  const response = await api.get<{ message: string; user: AdminUserDetails }>("/users/me");
  return response.data;
}

export async function updateProfile(input: { name: string; phoneNumber: string; imageUrl?: string }) {
  const response = await api.patch<{ message: string; user: AdminUser }>("/users/me", input);
  return response.data;
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post<{ message: string; user: AdminUser }>("/uploads/avatar", formData);
  return response.data;
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  const response = await api.patch<{ message: string }>("/users/me/change-password", input);
  return response.data;
}

export async function updateDeliveryProfile(input: { deliveryPrice: number; openTime: string; closeTime: string; coverageZones: DeliveryZone[] }) {
  const response = await api.patch<{ message: string; deliveryCompany: DeliveryCompanyDetails }>("/users/me/delivery-company", input);
  return response.data;
}
