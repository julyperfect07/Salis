"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Banknote, CheckCircle2, Navigation, Package, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/features/delivery-company/components/status-badge";
import { useDriverDashboard } from "../use-driver";

export function DriverDashboard() {
  const t = useTranslations("Driver"); const locale = useLocale(); const { data, isLoading, isError, refetch } = useDriverDashboard();
  const money = (v: string) => new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", { style: "currency", currency: "JOD" }).format(Number(v));
  if (isLoading) return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl"/>)}</div>;
  if (isError || !data) return <Card className="rounded-3xl"><CardContent className="flex min-h-64 flex-col items-center justify-center gap-4"><Package className="size-10 text-destructive"/><p>{t("common.loadError")}</p><Button onClick={() => refetch()}>{t("actions.retry")}</Button></CardContent></Card>;
  const cards = [{ label: t("dashboard.active"), value: data.activeOrders, icon: Navigation }, { label: t("dashboard.delivered"), value: data.deliveredToday, icon: CheckCircle2 }, { label: t("dashboard.failed"), value: data.failedOrders, icon: TriangleAlert }, { label: t("dashboard.cash"), value: money(data.cashCollectedToday), icon: Banknote }];
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon }, i) => <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }}><Card className={i === 0 ? "h-full rounded-3xl border-primary/20 bg-primary text-primary-foreground" : "h-full rounded-3xl"}><CardContent className="flex items-start justify-between p-5"><div><p className={i === 0 ? "text-xs text-primary-foreground/70" : "text-xs text-muted-foreground"}>{label}</p><p className="mt-4 text-2xl font-semibold">{value}</p></div><div className={i === 0 ? "rounded-xl bg-white/15 p-2.5" : "rounded-xl bg-primary/10 p-2.5 text-primary"}><Icon className="size-4"/></div></CardContent></Card></motion.div>)}</div>
    <Card className="rounded-3xl"><CardHeader className="flex flex-row items-center justify-between gap-3"><div><CardTitle>{t("dashboard.next")}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{t("dashboard.nextHint")}</p></div><Button variant="outline" className="rounded-full" render={<Link href={`/${locale}/driver/orders`}/>}>{t("actions.viewAll")}<ArrowRight className="size-4 rtl:rotate-180"/></Button></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">{data.nextOrders.length ? data.nextOrders.map(order => <Link key={order.id} href={`/${locale}/driver/orders/${order.id}`} className="rounded-2xl border p-4 transition hover:border-primary/30 hover:bg-primary/[.025]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{order.customerName}</p><p className="mt-1 truncate text-xs text-muted-foreground">{order.customerAddress}</p></div><StatusBadge status={order.status} label={t(`statuses.${order.status}`)}/></div><div className="mt-4 flex items-center justify-between text-xs"><span className="text-muted-foreground">{order.shopOwner.user.name}</span><span className="font-mono">#{order.id.slice(0,8)}</span></div></Link>) : <div className="col-span-full py-14 text-center"><CheckCircle2 className="mx-auto size-9 text-primary"/><p className="mt-3 font-medium">{t("dashboard.clear")}</p><p className="mt-1 text-sm text-muted-foreground">{t("dashboard.clearHint")}</p></div>}</CardContent></Card>
  </div>;
}
