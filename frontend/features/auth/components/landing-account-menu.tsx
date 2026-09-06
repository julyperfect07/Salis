"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, LoaderCircle, LogOut, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/navigation";
import type { UserRole } from "@/types/auth";

import { logout } from "../auth-api";
import { authQueryKey, useCurrentUser } from "../use-current-user";
import { LoginDialog } from "./login-dialog";

const dashboardRoutes: Record<UserRole, string> = {
  ADMIN: "/admin",
  SHOP_OWNER: "/shop-owner",
  DELIVERY_COMPANY: "/delivery-company",
  DRIVER: "/driver",
};

function getInitials(name?: string) {
  if (!name) return "S";

  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function LandingAccountMenu() {
  const t = useTranslations("DashboardShell");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();

  async function handleLogout() {
    await logout();
    queryClient.setQueryData(authQueryKey, null);
    router.refresh();
  }

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full" disabled>
        <LoaderCircle className="size-4 animate-spin" />
        <span className="sr-only">Loading account</span>
      </Button>
    );
  }

  if (!user) return <LoginDialog />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full p-0"
            aria-label={t("actions.accountMenu")}
          />
        }
      >
        <Avatar className="size-9">
          <AvatarImage
            src={user.imageUrl ?? undefined}
            alt={user.name ?? t("userFallback")}
          />
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-xl p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-2">
            <span className="block truncate text-sm font-semibold text-foreground">
              {user.name ?? t("userFallback")}
            </span>
            <span className="mt-0.5 block truncate font-normal">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer rounded-lg px-2 py-2"
          onClick={() => router.push(dashboardRoutes[user.role])}
        >
          <LayoutDashboard className="size-4" />
          {t("navigation.dashboard")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer rounded-lg px-2 py-2"
          onClick={() => router.push("/profile")}
        >
          <UserRound className="size-4" />
          {t("navigation.profile")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer rounded-lg px-2 py-2"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          {t("actions.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
