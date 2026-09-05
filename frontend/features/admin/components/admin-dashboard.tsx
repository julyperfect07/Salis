"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import {
  CircleDollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from "../use-admin-dashboard";

function formatMoney(value: string, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", {
    style: "currency",
    currency: "JOD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

interface StatCardProps {
  title: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  featured?: boolean;
}

function StatCard({
  title,
  value,
  detail,
  icon,
  featured = false,
}: StatCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.55,
      }}
    >
      <Card
        className={
          featured
            ? "h-full border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15"
            : "h-full bg-card"
        }
      >
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <p
              className={
                featured
                  ? "text-sm text-primary-foreground/75"
                  : "text-sm text-muted-foreground"
              }
            >
              {title}
            </p>

            <CardTitle className="mt-3 text-3xl font-medium tracking-tight">
              {value}
            </CardTitle>
          </div>

          <div
            className={
              featured
                ? "rounded-full bg-white/15 p-2.5"
                : "rounded-full bg-muted p-2.5 text-primary"
            }
          >
            {icon}
          </div>
        </CardHeader>

        <CardContent>
          <p
            className={
              featured
                ? "text-xs text-primary-foreground/70"
                : "text-xs text-muted-foreground"
            }
          >
            {detail}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-3xl" />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_0.8fr]">
        <Skeleton className="h-[390px] rounded-3xl" />
        <Skeleton className="h-[390px] rounded-3xl" />
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const locale = useLocale();
  const t = useTranslations("AdminDashboard");

  const { data, isLoading, isError, refetch } = useAdminDashboard();

  const chartConfig = {
    orders: {
      label: t("chart.orders"),
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive">
            <TrendingUp className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">{t("error.title")}</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("error.description")}
            </p>
          </div>

          <Button type="button" onClick={() => refetch()}>
            {t("actions.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const orderStatusData = [
    {
      status: t("statuses.pending"),
      orders: data.orders.byStatus.PENDING,
    },
    {
      status: t("statuses.accepted"),
      orders: data.orders.byStatus.ACCEPTED,
    },
    {
      status: t("statuses.pickedUp"),
      orders: data.orders.byStatus.PICKED_UP,
    },
    {
      status: t("statuses.outForDelivery"),
      orders: data.orders.byStatus.OUT_FOR_DELIVERY,
    },
    {
      status: t("statuses.delivered"),
      orders: data.orders.byStatus.DELIVERED,
    },
    {
      status: t("statuses.failed"),
      orders: data.orders.byStatus.FAILED,
    },
    {
      status: t("statuses.returned"),
      orders: data.orders.byStatus.RETURNED,
    },
    {
      status: t("statuses.cancelled"),
      orders: data.orders.byStatus.CANCELLED,
    },
  ];

  const roleData = [
    {
      label: t("roles.shopOwners"),
      value: data.users.shopOwners,
    },
    {
      label: t("roles.deliveryCompanies"),
      value: data.users.deliveryCompanies,
    },
    {
      label: t("roles.drivers"),
      value: data.users.drivers,
    },
    {
      label: t("roles.admins"),
      value: data.users.admins,
    },
  ];

  const maximumRoleCount = Math.max(...roleData.map((role) => role.value), 1);

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("cards.platformRevenue")}
          value={formatMoney(data.financials.platformRevenue, locale)}
          detail={t("cards.platformRevenueDetail")}
          icon={<CircleDollarSign className="size-5" />}
          featured
        />

        <StatCard
          title={t("cards.totalOrders")}
          value={data.orders.total}
          detail={t("cards.deliveredCount", {
            count: data.orders.byStatus.DELIVERED,
          })}
          icon={<ShoppingBag className="size-5" />}
        />

        <StatCard
          title={t("cards.totalUsers")}
          value={data.users.total}
          detail={t("cards.activeUsers", {
            count: data.users.active,
          })}
          icon={<Users className="size-5" />}
        />

        <StatCard
          title={t("cards.activeProducts")}
          value={data.products.active}
          detail={t("cards.totalProducts", {
            count: data.products.total,
          })}
          icon={<Package className="size-5" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.65fr_0.8fr]">
        <motion.div
          initial={{
            opacity: 0,
            x: locale === "ar" ? 16 : -16,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.65,
          }}
        >
          <Card className="h-full rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>{t("chart.title")}</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("chart.description")}
                </p>
              </div>

              <Badge variant="secondary" className="shrink-0 rounded-full px-3">
                {t("chart.orderCount", {
                  count: data.orders.total,
                })}
              </Badge>
            </CardHeader>

            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart
                  accessibilityLayer
                  data={orderStatusData}
                  margin={{
                    top: 12,
                    right: 8,
                    left: -24,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />

                  <XAxis
                    dataKey="status"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={11}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />

                  <ChartTooltip
                    cursor={{
                      fill: "var(--muted)",
                    }}
                    content={<ChartTooltipContent />}
                  />

                  <Bar
                    dataKey="orders"
                    fill="var(--color-orders)"
                    radius={[12, 12, 4, 4]}
                    maxBarSize={46}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            x: locale === "ar" ? -16 : 16,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.65,
          }}
        >
          <Card className="h-full rounded-3xl">
            <CardHeader>
              <CardTitle>{t("distribution.title")}</CardTitle>

              <p className="text-sm text-muted-foreground">
                {t("distribution.description")}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {roleData.map((role) => (
                <div key={role.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{role.label}</span>

                    <span className="text-sm text-muted-foreground">
                      {role.value}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(role.value / maximumRoleCount) * 100}%`,
                      }}
                      transition={{
                        duration: 0.9,
                        delay: 0.1,
                      }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={t("cards.customerPayments")}
          value={formatMoney(data.financials.customerTotal, locale)}
          detail={t("cards.customerPaymentsDetail")}
          icon={<CircleDollarSign className="size-5" />}
        />

        <StatCard
          title={t("cards.deliveryFees")}
          value={formatMoney(data.financials.deliveryFees, locale)}
          detail={t("cards.deliveryFeesDetail")}
          icon={<Truck className="size-5" />}
        />

        <StatCard
          title={t("cards.unpaidToShops")}
          value={formatMoney(data.financials.unpaidToShops, locale)}
          detail={t("cards.unpaidToShopsDetail")}
          icon={<TrendingUp className="size-5" />}
        />
      </section>
    </div>
  );
}
