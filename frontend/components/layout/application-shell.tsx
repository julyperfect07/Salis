"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardLayout } from "@/components/layout/dashboard-shell";

const dashboardSegments = new Set([
  "admin",
  "shop-owner",
  "delivery-company",
  "driver",
  "profile",
]);

export function ApplicationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const routeSegment = pathname.split("/").filter(Boolean)[1];

  if (!dashboardSegments.has(routeSegment)) {
    return children;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
