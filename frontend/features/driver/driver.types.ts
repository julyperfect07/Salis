import type { AdminOrder, AdminOrdersQuery } from "@/features/admin/orders.types";

export type DriverOrder = Omit<AdminOrder, "driver"> & { driver?: AdminOrder["driver"] };
export type DriverOrdersQuery = AdminOrdersQuery;

export interface DriverOrdersResponse {
  message: string;
  orders: DriverOrder[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface DriverOrderResponse { message: string; order: DriverOrder }

export interface DriverDashboardResponse {
  message: string;
  activeOrders: number;
  deliveredToday: number;
  failedOrders: number;
  cashCollectedToday: string;
  nextOrders: DriverOrder[];
}
