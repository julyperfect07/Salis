"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminDashboard } from "./admin-api";

export const adminDashboardQueryKey = ["admin", "dashboard"] as const;

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardQueryKey,
    queryFn: getAdminDashboard,
    staleTime: 60 * 1000,
  });
}
