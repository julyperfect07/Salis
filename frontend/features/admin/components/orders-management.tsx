"use client";

import { useDeferredValue, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ClipboardList, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "../orders.types";
import { useAdminOrders } from "../use-admin-orders";

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RETURNED",
  "CANCELLED",
];

const paymentStatuses: PaymentStatus[] = [
  "PENDING",
  "COLLECTED",
  "PAID_TO_SHOP",
  "NOT_COLLECTED",
];

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400",
  ACCEPTED: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400",
  PICKED_UP: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-400",
  OUT_FOR_DELIVERY: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-400",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",
  FAILED: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400",
  RETURNED: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-400",
  CANCELLED: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400",
};

export function OrdersManagement() {
  const locale = useLocale();
  const t = useTranslations("AdminOrders");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const deferredSearch = useDeferredValue(search.trim());

  const { data, isLoading, isError, refetch } = useAdminOrders({
    page,
    limit: 10,
    search: deferredSearch || undefined,
    status: status === "ALL" ? undefined : status,
    paymentStatus: paymentStatus === "ALL" ? undefined : paymentStatus,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const resetPage = () => setPage(1);
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  const formatMoney = (value: string) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", {
      style: "currency",
      currency: "JOD",
    }).format(Number(value));

  return (
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="space-y-4 border-b p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">{t("list.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("list.description")}</p>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_12rem_12rem_10rem_10rem]">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => { setSearch(event.target.value); resetPage(); }}
              placeholder={t("filters.search")}
              className="h-10 rounded-full ps-9"
            />
          </div>

          <Select value={status} onValueChange={(value) => { if (value) { setStatus(value as OrderStatus | "ALL"); resetPage(); } }}>
            <SelectTrigger className="h-10 w-full rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filters.allStatuses")}</SelectItem>
              {orderStatuses.map((value) => <SelectItem key={value} value={value}>{t(`statuses.${value}`)}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={paymentStatus} onValueChange={(value) => { if (value) { setPaymentStatus(value as PaymentStatus | "ALL"); resetPage(); } }}>
            <SelectTrigger className="h-10 w-full rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filters.allPayments")}</SelectItem>
              {paymentStatuses.map((value) => <SelectItem key={value} value={value}>{t(`payments.${value}`)}</SelectItem>)}
            </SelectContent>
          </Select>

          <Input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); resetPage(); }} aria-label={t("filters.fromDate")} className="h-10 rounded-full" />
          <Input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); resetPage(); }} aria-label={t("filters.toDate")} className="h-10 rounded-full" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-6">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-14 rounded-xl" />)}</div>
      ) : isError || !data ? (
        <div className="flex min-h-72 flex-col items-center justify-center gap-4 p-6 text-center">
          <ClipboardList className="size-10 text-destructive" />
          <div><h3 className="font-semibold">{t("error.title")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("error.description")}</p></div>
          <Button onClick={() => refetch()}>{t("actions.retry")}</Button>
        </div>
      ) : data.orders.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
          <ClipboardList className="size-10 text-primary" />
          <h3 className="mt-4 font-semibold">{t("empty.title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>{t("columns.order")}</TableHead><TableHead>{t("columns.customer")}</TableHead><TableHead>{t("columns.shop")}</TableHead><TableHead>{t("columns.status")}</TableHead><TableHead>{t("columns.payment")}</TableHead><TableHead>{t("columns.total")}</TableHead><TableHead>{t("columns.created")}</TableHead><TableHead className="text-end">{t("columns.actions")}</TableHead>
              </TableRow></TableHeader>
              <TableBody>{data.orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-primary/[0.035]">
                  <TableCell><span className="font-mono text-xs font-medium">#{order.id.slice(0, 8)}</span><p className="mt-1 text-xs text-muted-foreground">{order.orderItems.length} {t("items")}</p></TableCell>
                  <TableCell><p className="font-medium">{order.customerName}</p><p className="text-xs text-muted-foreground" dir="ltr">{order.customerPhone}</p></TableCell>
                  <TableCell>{order.shopOwner.user.name}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("rounded-full", statusStyles[order.status])}>{t(`statuses.${order.status}`)}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" className="rounded-full">{t(`payments.${order.paymentStatus}`)}</Badge></TableCell>
                  <TableCell className="font-medium">{formatMoney(order.customerTotal)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-end"><Link href={`/${locale}/admin/orders/${order.id}`} className="inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium hover:border-primary/30 hover:bg-primary/5 hover:text-primary">{t("actions.view")}</Link></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-muted-foreground">{t("showing", { shown: data.orders.length, total: data.pagination.total })}</p>
            <Pagination className="mx-0 w-auto justify-start sm:justify-end"><PaginationContent>
              <PaginationItem><Button variant="outline" size="icon" className="rounded-full" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label={t("actions.previous")}><ChevronLeft className="size-4 rtl:rotate-180" /></Button></PaginationItem>
              <PaginationItem><div className="flex h-9 min-w-20 items-center justify-center rounded-full bg-muted px-3 text-sm">{data.pagination.page} / {Math.max(data.pagination.totalPages, 1)}</div></PaginationItem>
              <PaginationItem><Button variant="outline" size="icon" className="rounded-full" disabled={page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)} aria-label={t("actions.next")}><ChevronRight className="size-4 rtl:rotate-180" /></Button></PaginationItem>
            </PaginationContent></Pagination>
          </div>
        </>
      )}
    </section>
  );
}
