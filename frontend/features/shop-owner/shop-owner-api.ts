import { api } from "@/lib/api/client";
import type { CreateOrderInput, Product, ProductInput, ProductsQuery, ProductsResponse, ShopOrder, ShopOrdersQuery, ShopOrdersResponse } from "./shop-owner.types";

export async function getProducts(query: ProductsQuery) { return (await api.get<ProductsResponse>("/products", { params: query })).data; }
export async function createProduct(input: ProductInput) { return (await api.post<{ message: string; product: Product }>("/products", input)).data; }
export async function updateProduct(id: string, input: ProductInput) { return (await api.patch<{ message: string; product: Product }>(`/products/${id}`, input)).data; }
export async function setProductActive(id: string, active: boolean) { return (await api.request<{ message: string }>({ url: active ? `/products/${id}/restore` : `/products/${id}`, method: active ? "PATCH" : "DELETE" })).data; }
export async function uploadProductImages(files: File[]) { const body = new FormData(); files.forEach((file) => body.append("images", file)); return (await api.post<{ message: string; imageUrls: string[] }>("/uploads/products", body)).data; }
export async function getShopOrders(query: ShopOrdersQuery) { return (await api.get<ShopOrdersResponse>("/orders", { params: query })).data; }
export async function getShopOrder(id: string) { return (await api.get<{ message: string; order: ShopOrder }>(`/orders/${id}`)).data; }
export async function createOrder(input: CreateOrderInput) { return (await api.post<{ message: string; order: ShopOrder }>("/orders", input)).data; }
export async function cancelOrder(id: string) { return (await api.patch<{ message: string; order: ShopOrder }>(`/orders/${id}/cancel`)).data; }
export async function getShopOwnerDashboard() { return (await api.get<{ message: string; activeProducts: number; totalOrders: number; netSales: string; recentOrders: ShopOrder[] }>("/orders/shop-owner/dashboard")).data; }
