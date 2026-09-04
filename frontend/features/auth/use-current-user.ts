"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "./auth-api";

export const authQueryKey = ["auth", "current-user"] as const;

//gives one cached source for the logged in user across the admin, shop owner, company, and driver dashboards
export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
