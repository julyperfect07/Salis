import type { AdminOrder, AdminOrdersQuery, AdminOrdersResponse } from "@/features/admin/orders.types";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsQuery { page: number; limit: number; search?: string; isActive?: boolean; sortBy?: "createdAt" | "name" | "price"; sortOrder?: "asc" | "desc" }
export interface ProductsResponse { message: string; products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }
export interface ProductInput { name: string; description?: string; price: number; imageUrls?: string[] }
export interface CreateOrderInput { customerName: string; customerPhone: string; customerAddress: string; customerNote?: string; customerLatitude?: number; customerLongitude?: number; deliveryZone: string; items: Array<{ productId: string; quantity: number }> }
export type ShopOrder = AdminOrder & { pickupCode?: string };
export type ShopOrdersQuery = AdminOrdersQuery;
export type ShopOrdersResponse = Omit<AdminOrdersResponse, "orders"> & { orders: ShopOrder[] };
