"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Boxes, CircleDollarSign, ClipboardList, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useShopOwnerDashboard } from "../use-shop-owner";

export function ShopOwnerDashboard() {
  const t = useTranslations("ShopOwner"); const locale = useLocale();
  const { data, isLoading } = useShopOwnerDashboard();
  if (isLoading || !data) return <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}</div>;
  const money = new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", { style: "currency", currency: "JOD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(data.netSales));
  const cards = [{ label: t("dashboard.activeProducts"), value: data.activeProducts, icon: Boxes }, { label: t("dashboard.totalOrders"), value: data.totalOrders, icon: ClipboardList }, { label: t("dashboard.netSales"), value: money, icon: CircleDollarSign }];
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon }, index) => <Card key={label} className={index === 2 ? "rounded-3xl bg-primary text-primary-foreground" : "rounded-3xl"}><CardHeader className="flex flex-row items-start justify-between"><div><p className={index === 2 ? "text-sm text-primary-foreground/70" : "text-sm text-muted-foreground"}>{label}</p><CardTitle className="mt-4 text-3xl">{value}</CardTitle></div><div className={index === 2 ? "rounded-2xl bg-white/15 p-3" : "rounded-2xl bg-primary/10 p-3 text-primary"}><Icon className="size-5" /></div></CardHeader></Card>)}</div><Card className="rounded-3xl"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>{t("dashboard.recentOrders")}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{t("dashboard.recentOrdersDescription")}</p></div><Button render={<Link href={`/${locale}/shop-owner/orders/new`} />} className="rounded-full"><Plus className="size-4" />{t("orders.new")}</Button></CardHeader><CardContent className="space-y-2">{data.recentOrders.length ? data.recentOrders.map((order) => <Link key={order.id} href={`/${locale}/shop-owner/orders/${order.id}`} className="flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm"><div><p className="font-medium">{order.customerName}</p><p className="mt-1 font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p></div><Badge variant="secondary" className="rounded-full">{t(`statuses.${order.status}`)}</Badge></Link>) : <p className="py-12 text-center text-muted-foreground">{t("orders.empty")}</p>}</CardContent></Card></div>;
}
