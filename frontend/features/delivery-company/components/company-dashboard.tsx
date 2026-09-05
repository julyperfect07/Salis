"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Banknote, CheckCircle2, Clock3, Package, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyDashboard } from "../use-delivery-company";
import { StatusBadge } from "./status-badge";

export function CompanyDashboard() {
  const t = useTranslations("DeliveryCompany");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useCompanyDashboard();
  const money = (value: string) => new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", { style: "currency", currency: "JOD" }).format(Number(value));

  if (isLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}</div>;
  if (isError || !data) return <Card className="rounded-3xl"><CardContent className="flex min-h-64 flex-col items-center justify-center gap-4"><Package className="size-10 text-destructive" /><p>{t("common.loadError")}</p><Button onClick={() => refetch()}>{t("actions.retry")}</Button></CardContent></Card>;

  const cards = [
    { label: t("dashboard.pending"), value: data.pendingOrders, icon: Clock3, tone: "bg-amber-500/10 text-amber-600" },
    { label: t("dashboard.inProgress"), value: data.activeOrders, icon: Truck, tone: "bg-blue-500/10 text-blue-600" },
    { label: t("dashboard.activeDrivers"), value: data.activeDrivers, icon: Users, tone: "bg-violet-500/10 text-violet-600" },
    { label: t("dashboard.netEarnings"), value: money(data.netEarnings), icon: Banknote, tone: "bg-primary-foreground/15 text-primary-foreground" },
  ];

  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone }, index) =>
      <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }}>
        <Card className={index === 3 ? "h-full overflow-hidden rounded-3xl border-primary bg-primary text-primary-foreground" : "h-full rounded-3xl"}>
          <CardContent className="flex items-start justify-between p-6"><div><p className={index === 3 ? "text-sm text-primary-foreground/70" : "text-sm text-muted-foreground"}>{label}</p><p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p></div><div className={`rounded-2xl p-3 ${tone}`}><Icon className="size-5" /></div></CardContent>
        </Card>
      </motion.div>)}</div>

    <div className="grid gap-5 lg:grid-cols-[1.5fr_.7fr]">
      <Card className="rounded-3xl"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>{t("dashboard.recent")}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{t("dashboard.recentHint")}</p></div><Button variant="outline" className="rounded-full" render={<Link href={`/${locale}/delivery-company/orders`} />}>{t("actions.viewAll")}<ArrowRight className="size-4 rtl:rotate-180" /></Button></CardHeader><CardContent className="space-y-2">{data.recentOrders.length ? data.recentOrders.map(order => <Link key={order.id} href={`/${locale}/delivery-company/orders/${order.id}`} className="flex items-center justify-between gap-4 rounded-2xl border p-4 transition hover:border-primary/30 hover:bg-primary/[.025]"><div className="min-w-0"><p className="truncate font-medium">{order.customerName}</p><p className="mt-1 text-xs text-muted-foreground">{order.shopOwner.user.name} · #{order.id.slice(0, 8)}</p></div><StatusBadge status={order.status} label={t(`statuses.${order.status}`)} /></Link>) : <p className="py-12 text-center text-muted-foreground">{t("orders.empty")}</p>}</CardContent></Card>
      <Card className="rounded-3xl bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_42%)]"><CardContent className="flex h-full min-h-72 flex-col justify-between p-6"><div><div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CheckCircle2 /></div><p className="text-4xl font-semibold">{data.deliveredOrders}</p><p className="mt-2 text-sm text-muted-foreground">{t("dashboard.delivered")}</p></div><div className="mt-8 border-t pt-5"><p className="text-sm text-muted-foreground">{t("dashboard.totalOrders")}</p><p className="mt-1 text-xl font-semibold">{data.totalOrders}</p></div></CardContent></Card>
    </div>
  </div>;
}
