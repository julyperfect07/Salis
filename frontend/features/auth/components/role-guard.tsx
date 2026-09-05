"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import type { UserRole } from "@/types/auth";

import { useCurrentUser } from "../use-current-user";

const dashboardRoutes: Record<UserRole, string> = {
  ADMIN: "/admin",
  SHOP_OWNER: "/shop-owner",
  DELIVERY_COMPANY: "/delivery-company",
  DRIVER: "/driver",
};

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  const isAllowed = Boolean(user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (isLoading) return;

    if (isError || !user) {
      router.replace("/");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace(dashboardRoutes[user.role]);
    }
  }, [allowedRoles, isError, isLoading, router, user]);

  if (isLoading || !isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-primary">
          <LoaderCircle className="size-7 animate-spin" />

          <p className="text-sm font-medium text-muted-foreground">
            Loading Salis...
          </p>
        </div>
      </div>
    );
  }

  return children;
}
