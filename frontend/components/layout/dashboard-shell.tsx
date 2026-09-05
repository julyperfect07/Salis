"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Truck,
  UserRound,
  Users,
} from "lucide-react";

import { FloatingDock } from "@/components/ui/floating-dock";
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
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/features/auth/auth-api";
import { authQueryKey, useCurrentUser } from "@/features/auth/use-current-user";
import type { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  contentClassName?: string;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: ReactNode;
}

const iconClassName = "size-full";

const roleRoutes: Record<UserRole, string> = {
  ADMIN: "/admin",
  SHOP_OWNER: "/shop-owner",
  DELIVERY_COMPANY: "/delivery-company",
  DRIVER: "/driver",
};

function getInitials(name?: string) {
  if (!name) {
    return "S";
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function DashboardShell({
  children,
  title,
  description,
  action,
  contentClassName,
}: DashboardShellProps) {
  const locale = useLocale();
  const t = useTranslations("DashboardShell");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const isArabic = locale === "ar";

  const navigationItems: NavigationItem[] = user
    ? [
        {
          title: t("navigation.dashboard"),
          href: `/${locale}${roleRoutes[user.role]}`,
          icon: <LayoutDashboard className={iconClassName} />,
        },

        ...(user.role === "ADMIN"
          ? [
              {
                title: t("navigation.users"),
                href: `/${locale}/admin/users`,
                icon: <Users className={iconClassName} />,
              },
              {
                title: t("navigation.orders"),
                href: `/${locale}/admin/orders`,
                icon: <ClipboardList className={iconClassName} />,
              },
            ]
          : []),

        ...(user.role === "SHOP_OWNER"
          ? [
              {
                title: t("navigation.products"),
                href: `/${locale}/shop-owner/products`,
                icon: <Boxes className={iconClassName} />,
              },
              {
                title: t("navigation.orders"),
                href: `/${locale}/shop-owner/orders`,
                icon: <ClipboardList className={iconClassName} />,
              },
            ]
          : []),

        ...(user.role === "DELIVERY_COMPANY"
          ? [
              {
                title: t("navigation.orders"),
                href: `/${locale}/delivery-company/orders`,
                icon: <PackageCheck className={iconClassName} />,
              },
              {
                title: t("navigation.drivers"),
                href: `/${locale}/delivery-company/drivers`,
                icon: <Truck className={iconClassName} />,
              },
            ]
          : []),

        ...(user.role === "DRIVER"
          ? [
              {
                title: t("navigation.myOrders"),
                href: `/${locale}/driver/orders`,
                icon: <ClipboardList className={iconClassName} />,
              },
            ]
          : []),

        {
          title: t("navigation.profile"),
          href: `/${locale}/profile`,
          icon: <UserRound className={iconClassName} />,
        },
      ]
    : [];

  const formattedDate = new Intl.DateTimeFormat(isArabic ? "ar-JO" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  async function handleLogout() {
    await logout();

    queryClient.setQueryData(authQueryKey, null);

    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-[#dedee2] p-2 sm:p-4 lg:p-7 dark:bg-[#111411]">
      <div className="mx-auto min-h-[calc(100vh-1rem)] max-w-375 overflow-hidden rounded-[2rem] border border-white/70 bg-[#f4f5f2] shadow-sm sm:min-h-[calc(100vh-2rem)] dark:border-white/10 dark:bg-[#171a17]">
        <header className="px-3 pt-3 sm:px-5 sm:pt-5">
          <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/90 px-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#202420]/90 sm:px-4">
            <Link
              href={user ? `/${locale}${roleRoutes[user.role]}` : `/${locale}`}
              className="group flex shrink-0 items-center gap-2.5"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
                <PackageCheck className="size-4" />
              </div>

              <div className="hidden sm:block">
                <p className="font-semibold leading-none">{t("brand")}</p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t("brandSubtitle")}
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />

              <div className="mx-1 hidden h-7 w-px bg-border sm:block" />

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
                      src={user?.imageUrl ?? undefined}
                      alt={user?.name ?? t("userFallback")}
                    />

                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 rounded-xl p-2"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-2 py-2">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {user?.name ?? t("userFallback")}
                      </span>
                      <span className="mt-0.5 block truncate font-normal">
                        {user?.email}
                      </span>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg px-2 py-2"
                    onClick={() => router.push("/profile")}
                  >
                    <UserRound className="size-4" />
                    {t("navigation.profile")}
                  </DropdownMenuItem>

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
            </div>
          </div>
        </header>

        <main className="px-4 pb-28 pt-8 sm:px-7 md:pl-24 lg:pr-12 lg:pl-28">
          <div className={cn("mx-auto max-w-7xl", contentClassName)}>
            <section className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-primary">
                  {t("welcome")} {user?.name?.split(" ")[0] ?? ""}
                </p>

                <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  {title}
                </h1>

                {description && (
                  <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm shadow-sm">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span>{formattedDate}</span>
                </div>

                {action}
              </div>
            </section>

            {children}
          </div>
        </main>
      </div>

      {navigationItems.length > 0 && (
        <FloatingDock
          items={navigationItems}
          desktopClassName="fixed left-5 top-1/2 z-50 -translate-y-1/2 border border-border bg-background/90 shadow-xl backdrop-blur-xl dark:bg-card/90"
          mobileClassName="fixed bottom-5 left-5 z-50"
        />
      )}
    </div>
  );
}
