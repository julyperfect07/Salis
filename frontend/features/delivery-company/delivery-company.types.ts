import type { AdminOrder, AdminOrdersQuery, AdminOrdersResponse } from "@/features/admin/orders.types";

export type CompanyOrder = AdminOrder;
export type CompanyOrdersQuery = AdminOrdersQuery;
export type CompanyOrdersResponse = AdminOrdersResponse;

export interface CompanyDashboardResponse {
  message: string;
  activeDrivers: number;
  totalOrders: number;
  pendingOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  netEarnings: string;
  recentOrders: CompanyOrder[];
}

export interface CompanyDriver {
  userId: string;
  companyId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    imageUrl: string | null;
    role: "DRIVER";
    isActive?: boolean;
  };
}

export interface DriversResponse {
  message: string;
  drivers: CompanyDriver[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CreateDriverInput {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}
