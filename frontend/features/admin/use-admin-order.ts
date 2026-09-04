"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminOrder } from "./orders-api";

export function useAdminOrder(orderId: string) {
  return useQuery({
    queryKey: ["admin", "orders", orderId],
    queryFn: () => getAdminOrder(orderId),
    enabled: Boolean(orderId),
    staleTime: 30 * 1000,
  });
}
