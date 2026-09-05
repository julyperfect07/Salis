"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, MapPin, PackageSearch, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/features/delivery-company/components/status-badge";
import type { OrderStatus } from "@/features/admin/orders.types";
import { useDriverOrders } from "../use-driver";

const filters: Array<OrderStatus | "ACTIVE"> = ["ACTIVE", "ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"];
export function DriverOrders() {
  const t = useTranslations("Driver"); const locale = useLocale(); const [page, setPage] = useState(1); const [filter, setFilter] = useState<OrderStatus | "ACTIVE">("ACTIVE");
  const queryStatus = filter === "ACTIVE" ? undefined : filter; const { data, isLoading, isError, refetch } = useDriverOrders({ page, limit: filter === "ACTIVE" ? 100 : 8, status: queryStatus });
  const visible = filter === "ACTIVE" ? data?.orders.filter(o => ["ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.status)) : data?.orders;
  return <div className="space-y-4"><div className="flex justify-end"><Select value={filter} onValueChange={v => { if (v) { setFilter(v as typeof filter); setPage(1); } }}><SelectTrigger className="h-10 w-full rounded-full bg-card sm:w-56"><SelectValue/></SelectTrigger><SelectContent>{filters.map(f => <SelectItem value={f} key={f}>{f === "ACTIVE" ? t("orders.active") : t(`statuses.${f}`)}</SelectItem>)}</SelectContent></Select></div>
    {isLoading ? <div className="grid gap-3 md:grid-cols-2">{Array.from({ length: 6 }).map((_,i) => <Skeleton key={i} className="h-48 rounded-3xl"/>)}</div> : isError || !data ? <Card><CardContent className="flex min-h-64 flex-col items-center justify-center gap-4"><PackageSearch className="size-10 text-destructive"/><p>{t("common.loadError")}</p><Button onClick={() => refetch()}>{t("actions.retry")}</Button></CardContent></Card> : !visible?.length ? <Card className="rounded-3xl"><CardContent className="flex min-h-64 flex-col items-center justify-center text-center"><PackageSearch className="size-10 text-primary"/><p className="mt-4 font-medium">{t("orders.empty")}</p><p className="mt-1 text-sm text-muted-foreground">{t("orders.emptyHint")}</p></CardContent></Card> : <div className="grid gap-3 md:grid-cols-2">{visible.map(order => <Link key={order.id} href={`/${locale}/driver/orders/${order.id}`} className="rounded-3xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0,8)}</p><h2 className="mt-2 font-semibold">{order.customerName}</h2></div><StatusBadge status={order.status} label={t(`statuses.${order.status}`)}/></div><div className="mt-5 space-y-2 border-t pt-4 text-sm"><p className="flex items-center gap-2"><Store className="size-4 text-primary"/><span className="truncate">{order.shopOwner.user.name}</span></p><p className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-4"/><span className="truncate">{order.customerAddress}</span></p></div></Link>)}</div>}
    {data && filter !== "ACTIVE" && data.pagination.totalPages > 1 && <div className="flex items-center justify-center gap-3"><Button variant="outline" size="icon" className="rounded-full" disabled={page === 1} onClick={() => setPage(p=>p-1)}><ChevronLeft className="size-4 rtl:rotate-180"/></Button><span className="text-sm text-muted-foreground">{page} / {data.pagination.totalPages}</span><Button variant="outline" size="icon" className="rounded-full" disabled={page === data.pagination.totalPages} onClick={() => setPage(p=>p+1)}><ChevronRight className="size-4 rtl:rotate-180"/></Button></div>}
  </div>;
}
