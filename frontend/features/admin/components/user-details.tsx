"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminUser } from "../use-admin-user";
import { EditUserDialog } from "./edit-user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { UserStatusDialog } from "./user-status-dialog";

interface UserDetailsProps {
  userId: string;
}

interface DetailItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-muted/45 p-4 transition-colors duration-200 hover:bg-muted/70">
      <div className="mt-0.5 rounded-full bg-background p-2 text-primary shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>

        <div className="mt-1 break-words text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function UserDetailsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
      <Skeleton className="h-80 rounded-3xl" />

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export function UserDetails({ userId }: UserDetailsProps) {
  const locale = useLocale();
  const t = useTranslations("AdminUsers");

  const { data, isLoading, isError, refetch } = useAdminUser(userId);

  if (isLoading) {
    return <UserDetailsSkeleton />;
  }

  if (isError || !data) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive">
            <UserRound className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">{t("details.errorTitle")}</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("details.errorDescription")}
            </p>
          </div>

          <Button type="button" onClick={() => refetch()}>
            {t("actions.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { user } = data;

  const formattedCreatedDate = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-JO" : "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(new Date(user.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${locale}/admin/users`}
          className="inline-flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-medium transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("details.back")}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <EditUserDialog user={user} />
          <ResetPasswordDialog user={user} />
          <UserStatusDialog user={user} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <Card className="rounded-3xl">
          <CardContent className="flex h-full flex-col items-center justify-center p-7 text-center">
            <Avatar className="size-24 border-4 border-primary/10">
              <AvatarImage src={user.imageUrl ?? undefined} alt={user.name} />

              <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight">
              {user.name}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {t(`roles.${user.role}`)}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 rounded-full px-3 py-1",
                  user.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    user.isActive ? "bg-emerald-500" : "bg-red-500",
                  )}
                />

                {user.isActive ? t("list.active") : t("list.inactive")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("details.accountInformation")}</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={<Mail className="size-4" />}
              label={t("details.email")}
              value={user.email}
            />

            <DetailItem
              icon={<Phone className="size-4" />}
              label={t("details.phone")}
              value={user.phoneNumber}
            />

            <DetailItem
              icon={<ShieldCheck className="size-4" />}
              label={t("details.role")}
              value={t(`roles.${user.role}`)}
            />

            <DetailItem
              icon={<CalendarDays className="size-4" />}
              label={t("details.createdAt")}
              value={formattedCreatedDate}
            />
          </CardContent>
        </Card>
      </div>

      {user.deliveryCompany && (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("details.deliveryCompanyInformation")}</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DetailItem
              icon={<CircleDollarSign className="size-4" />}
              label={t("details.deliveryPrice")}
              value={`${user.deliveryCompany.deliveryPrice} ${t("details.currency")}`}
            />

            <DetailItem
              icon={<Clock3 className="size-4" />}
              label={t("details.workingHours")}
              value={`${user.deliveryCompany.openTime} – ${user.deliveryCompany.closeTime}`}
            />

            <DetailItem
              icon={<Truck className="size-4" />}
              label={t("details.drivers")}
              value={user.deliveryCompany._count.drivers}
            />

            <DetailItem
              icon={<Package className="size-4" />}
              label={t("details.orders")}
              value={user.deliveryCompany._count.orders}
            />

            <div className="sm:col-span-2 xl:col-span-4">
              <DetailItem
                icon={<MapPin className="size-4" />}
                label={t("details.coverageZones")}
                value={
                  user.deliveryCompany.coverageZones.length > 0
                    ? user.deliveryCompany.coverageZones
                        .map((zone) =>
                          t(
                            `zones.${zone}` as
                              | "zones.AMMAN_CENTRAL"
                              | "zones.AMMAN_WEST"
                              | "zones.AMMAN_EAST"
                              | "zones.AMMAN_NORTH"
                              | "zones.AMMAN_SOUTH",
                          ),
                        )
                        .join(", ")
                    : t("details.noCoverageZones")
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {user.driver && (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("details.driverInformation")}</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={<Building2 className="size-4" />}
              label={t("details.deliveryCompany")}
              value={user.driver.company.user.name}
            />

            <DetailItem
              icon={<Package className="size-4" />}
              label={t("details.assignedOrders")}
              value={user.driver._count.orders}
            />
          </CardContent>
        </Card>
      )}

      {user.shopOwner && (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("details.shopInformation")}</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={<Package className="size-4" />}
              label={t("details.products")}
              value={user.shopOwner._count?.products ?? 0}
            />

            <DetailItem
              icon={<Truck className="size-4" />}
              label={t("details.orders")}
              value={user.shopOwner._count?.orders ?? 0}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
