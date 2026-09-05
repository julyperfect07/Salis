import { api } from "@/lib/api/client";
import type { DriverDashboardResponse, DriverOrderResponse, DriverOrdersQuery, DriverOrdersResponse } from "./driver.types";

export async function getDashboard() { return (await api.get<DriverDashboardResponse>("/orders/driver/dashboard")).data; }
export async function getOrders(query: DriverOrdersQuery) { return (await api.get<DriverOrdersResponse>("/orders/driver/assigned", { params: query })).data; }
export async function getOrder(id: string) { return (await api.get<DriverOrderResponse>(`/orders/${id}`)).data; }
export async function verifyPickup(id: string, pickupCode: string) { return (await api.patch<DriverOrderResponse>(`/orders/${id}/pickup`, { pickupCode })).data; }
export async function startDelivery(id: string) { return (await api.patch<DriverOrderResponse>(`/orders/${id}/start-delivery`)).data; }
export async function deliverOrder(id: string) { return (await api.patch<DriverOrderResponse>(`/orders/${id}/deliver`)).data; }
export async function failOrder(id: string, reason: string) { return (await api.patch<DriverOrderResponse>(`/orders/${id}/mark-failed`, { reason })).data; }
