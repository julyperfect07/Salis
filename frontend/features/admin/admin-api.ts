import { api } from "@/lib/api/client";
import type { AdminDashboardResponse } from "./admin.types";

export async function getAdminDashboard() {
  const response = await api.get<AdminDashboardResponse>("/admin/dashboard");

  return response.data;
}
