"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminOrders } from "./orders-api";
import type { AdminOrdersQuery } from "./orders.types";

export function useAdminOrders(query: AdminOrdersQuery) {
  return useQuery({
    queryKey: ["admin", "orders", query],
    queryFn: () => getAdminOrders(query),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}
