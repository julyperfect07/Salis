import { api } from "@/lib/api/client";
import type { AdminOrderResponse, AdminOrdersQuery, AdminOrdersResponse } from "./orders.types";

export async function getAdminOrders(query: AdminOrdersQuery) {
  const response = await api.get<AdminOrdersResponse>("/admin/orders", {
    params: query,
  });

  return response.data;
}

export async function getAdminOrder(orderId: string) {
  const response = await api.get<AdminOrderResponse>(`/orders/${orderId}`);

  return response.data;
}
