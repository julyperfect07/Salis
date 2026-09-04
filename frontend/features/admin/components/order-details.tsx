"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Building2, ClipboardList, MapPin, Package, Phone, Truck, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOrder } from "../use-admin-order";

interface OrderDetailsProps { orderId: string }
interface DetailProps { label: string; value: React.ReactNode }

function Detail({ label, value }: DetailProps) {
  return <div className="rounded-2xl bg-muted/45 p-4"><p className="text-xs text-muted-foreground">{label}</p><div className="mt-1 font-medium">{value}</div></div>;
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const locale = useLocale();
  const t = useTranslations("AdminOrders");
  const { data, isLoading, isError, refetch } = useAdminOrder(orderId);

  if (isLoading) return <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-52 rounded-3xl" />)}</div>;
  if (isError || !data) return <Card className="rounded-3xl"><CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 text-center"><ClipboardList className="size-10 text-destructive" /><div><h2 className="font-semibold">{t("details.errorTitle")}</h2><p className="mt-1 text-muted-foreground">{t("details.errorDescription")}</p></div><Button onClick={() => refetch()}>{t("actions.retry")}</Button></CardContent></Card>;

  const { order } = data;
  const money = (value: string) => new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", { style: "currency", currency: "JOD" }).format(Number(value));
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.createdAt));

  return <div className="space-y-4">
    <Link href={`/${locale}/admin/orders`} className="inline-flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-medium hover:border-primary/30 hover:bg-primary/5 hover:text-primary"><ArrowLeft className="size-4 rtl:rotate-180" />{t("details.back")}</Link>
    <Card className="rounded-3xl"><CardHeader className="border-b"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle>#{order.id.slice(0, 8)}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{date}</p></div><div className="flex gap-2"><Badge variant="outline" className="rounded-full">{t(`statuses.${order.status}`)}</Badge><Badge variant="secondary" className="rounded-full">{t(`payments.${order.paymentStatus}`)}</Badge></div></div></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Detail label={t("details.customer")} value={<span className="flex items-center gap-2"><UserRound className="size-4 text-primary" />{order.customerName}</span>} /><Detail label={t("details.phone")} value={<span className="flex items-center gap-2" dir="ltr"><Phone className="size-4 text-primary" />{order.customerPhone}</span>} /><Detail label={t("details.address")} value={<span className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{order.customerAddress}</span>} /><Detail label={t("details.zone")} value={order.deliveryZone ? t(`zones.${order.deliveryZone}`) : t("details.notAssigned")} /></CardContent></Card>
    <div className="grid gap-4 lg:grid-cols-2"><Card className="rounded-3xl"><CardHeader><CardTitle>{t("details.fulfillment")}</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><Detail label={t("details.shop")} value={<span className="flex items-center gap-2"><Building2 className="size-4 text-primary" />{order.shopOwner.user.name}</span>} /><Detail label={t("details.company")} value={order.deliveryCompany?.user.name ?? t("details.notAssigned")} /><Detail label={t("details.driver")} value={<span className="flex items-center gap-2"><Truck className="size-4 text-primary" />{order.driver?.user.name ?? t("details.notAssigned")}</span>} /><Detail label={t("details.note")} value={order.customerNote || t("details.none")} /></CardContent></Card>
    <Card className="rounded-3xl"><CardHeader><CardTitle>{t("details.financials")}</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><Detail label={t("details.productsTotal")} value={money(order.totalPrice)} /><Detail label={t("details.deliveryFee")} value={money(order.deliveryFee)} /><Detail label={t("details.shopCommission")} value={money(order.shopCommission)} /><Detail label={t("details.customerTotal")} value={money(order.customerTotal)} /></CardContent></Card></div>
    <Card className="rounded-3xl"><CardHeader><CardTitle className="flex items-center gap-2"><Package className="size-5 text-primary" />{t("details.items")}</CardTitle></CardHeader><CardContent className="divide-y">{order.orderItems.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div><p className="font-medium">{item.product.name}</p><p className="text-xs text-muted-foreground">{t("details.quantity", { count: item.quantity })}</p></div><p className="font-medium">{money(String(Number(item.product.price) * item.quantity))}</p></div>)}</CardContent></Card>
  </div>;
}
