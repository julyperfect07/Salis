"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminUser } from "./users-api";

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => getAdminUser(userId),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}
