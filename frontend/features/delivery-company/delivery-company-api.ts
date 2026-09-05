import { api } from "@/lib/api/client";
import type { AdminOrderResponse } from "@/features/admin/orders.types";
import type { CompanyDashboardResponse, CompanyOrdersQuery, CompanyOrdersResponse, CreateDriverInput, DriversResponse } from "./delivery-company.types";

export async function getCompanyDashboard() {
  return (await api.get<CompanyDashboardResponse>("/orders/delivery-company/dashboard")).data;
}

export async function getCompanyOrders(query: CompanyOrdersQuery) {
  return (await api.get<CompanyOrdersResponse>("/orders/assigned", { params: query })).data;
}

export async function getCompanyOrder(id: string) {
  return (await api.get<AdminOrderResponse>(`/orders/${id}`)).data;
}

export async function acceptOrder(id: string) {
  return (await api.patch<AdminOrderResponse>(`/orders/${id}/accept`)).data;
}

export async function rejectOrder(id: string, reason: string) {
  return (await api.patch<AdminOrderResponse>(`/orders/${id}/reject`, { reason })).data;
}

export async function assignDriver(id: string, driverId: string) {
  return (await api.patch<AdminOrderResponse>(`/orders/${id}/assign-driver`, { driverId })).data;
}

export async function confirmPayment(id: string) {
  return (await api.patch<AdminOrderResponse>(`/orders/${id}/confirm-payment`)).data;
}

export async function getDrivers(page = 1, limit = 100) {
  return (await api.get<DriversResponse>("/users/drivers", { params: { page, limit } })).data;
}

export async function createDriver(input: CreateDriverInput) {
  return (await api.post("/users/drivers", input)).data;
}

export async function updateDriverStatus(id: string, isActive: boolean) {
  return (await api.patch(`/users/drivers/${id}/status`, { isActive })).data;
}
