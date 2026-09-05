"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, PackageSearch, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderStatus } from "@/features/admin/orders.types";
import { useCompanyOrders } from "../use-delivery-company";
import { StatusBadge } from "./status-badge";

const statuses: OrderStatus[] = ["PENDING", "ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED", "CANCELLED", "REJECTED"];

export function CompanyOrders() {
  const t = useTranslations("DeliveryCompany"); const locale = useLocale();
  const [page, setPage] = useState(1); const [search, setSearch] = useState(""); const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const deferredSearch = useDeferredValue(search.trim());
  const { data, isLoading, isError, refetch } = useCompanyOrders({ page, limit: 9, search: deferredSearch || undefined, status: status === "ALL" ? undefined : status });
  const money = (v: string) => new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", { style: "currency", currency: "JOD" }).format(Number(v));
  const date = (v: string) => new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(v));

  return <div className="space-y-4"><Card className="rounded-3xl"><CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_13rem] sm:p-5"><div className="relative"><Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={t("orders.search")} className="h-11 rounded-full ps-11" /></div><Select value={status} onValueChange={value => { if (value) { setStatus(value as OrderStatus | "ALL"); setPage(1); } }}><SelectTrigger className="h-11 w-full rounded-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">{t("orders.allStatuses")}</SelectItem>{statuses.map(s => <SelectItem key={s} value={s}>{t(`statuses.${s}`)}</SelectItem>)}</SelectContent></Select></CardContent></Card>
    {isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-3xl" />)}</div> : isError || !data ? <Card className="rounded-3xl"><CardContent className="flex min-h-72 flex-col items-center justify-center gap-4"><PackageSearch className="size-10 text-destructive" /><p>{t("common.loadError")}</p><Button onClick={() => refetch()}>{t("actions.retry")}</Button></CardContent></Card> : data.orders.length === 0 ? <Card className="rounded-3xl"><CardContent className="flex min-h-72 flex-col items-center justify-center"><PackageSearch className="size-10 text-primary" /><p className="mt-4 font-medium">{t("orders.empty")}</p><p className="mt-1 text-sm text-muted-foreground">{t("orders.emptyHint")}</p></CardContent></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.orders.map(order => <Link key={order.id} href={`/${locale}/delivery-company/orders/${order.id}`} className="group rounded-3xl border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p><h2 className="mt-2 text-lg font-semibold">{order.customerName}</h2></div><StatusBadge status={order.status} label={t(`statuses.${order.status}`)} /></div><div className="my-5 h-px bg-border" /><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">{t("orders.shop")}</p><p className="mt-1 truncate font-medium">{order.shopOwner.user.name}</p></div><div><p className="text-xs text-muted-foreground">{t("orders.driver")}</p><p className="mt-1 truncate font-medium">{order.driver?.user.name ?? t("orders.unassigned")}</p></div><div><p className="text-xs text-muted-foreground">{t("orders.value")}</p><p className="mt-1 font-medium">{money(order.customerTotal)}</p></div><div><p className="text-xs text-muted-foreground">{t("orders.created")}</p><p className="mt-1 font-medium">{date(order.createdAt)}</p></div></div></Link>)}</div>}
    {data && data.pagination.totalPages > 1 && <div className="flex items-center justify-between rounded-full border bg-card px-4 py-2"><p className="text-sm text-muted-foreground">{t("orders.showing", { count: data.orders.length, total: data.pagination.total })}</p><div className="flex items-center gap-2"><Button size="icon" variant="ghost" className="rounded-full" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="size-4 rtl:rotate-180" /></Button><span className="text-sm">{page} / {data.pagination.totalPages}</span><Button size="icon" variant="ghost" className="rounded-full" disabled={page === data.pagination.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="size-4 rtl:rotate-180" /></Button></div></div>}
  </div>;
}
