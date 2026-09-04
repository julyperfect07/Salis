"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as service from "./shop-owner-api";
import type { ProductsQuery, ShopOrdersQuery } from "./shop-owner.types";

export function useProducts(query: ProductsQuery) { return useQuery({ queryKey: ["products", query], queryFn: () => service.getProducts(query), placeholderData: (old) => old }); }
export function useProductMutations() { const client = useQueryClient(); const done = () => client.invalidateQueries({ queryKey: ["products"] }); return {
  create: useMutation({ mutationFn: service.createProduct, onSuccess: done }),
  update: useMutation({ mutationFn: ({ id, input }: { id: string; input: Parameters<typeof service.updateProduct>[1] }) => service.updateProduct(id, input), onSuccess: done }),
  active: useMutation({ mutationFn: ({ id, active }: { id: string; active: boolean }) => service.setProductActive(id, active), onSuccess: done }),
  upload: useMutation({ mutationFn: service.uploadProductImages }),
}; }
export function useShopOrders(query: ShopOrdersQuery) { return useQuery({ queryKey: ["shop-orders", query], queryFn: () => service.getShopOrders(query), placeholderData: (old) => old }); }
export function useShopOrder(id: string) { return useQuery({ queryKey: ["shop-orders", id], queryFn: () => service.getShopOrder(id) }); }
export function useCreateOrder() { const client = useQueryClient(); return useMutation({ mutationFn: service.createOrder, onSuccess: () => client.invalidateQueries({ queryKey: ["shop-orders"] }) }); }
export function useCancelOrder() { const client = useQueryClient(); return useMutation({ mutationFn: service.cancelOrder, onSuccess: () => client.invalidateQueries({ queryKey: ["shop-orders"] }) }); }
export function useShopOwnerDashboard() { return useQuery({ queryKey: ["shop-owner-dashboard"], queryFn: service.getShopOwnerDashboard }); }
