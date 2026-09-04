"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminUsers } from "./users-api";
import type { AdminUsersQuery } from "./users.types";

export function useAdminUsers(query: AdminUsersQuery) {
  return useQuery({
    queryKey: [
      "admin",
      "users",
      query.page,
      query.limit,
      query.search,
      query.role,
    ],
    queryFn: () => getAdminUsers(query),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}
