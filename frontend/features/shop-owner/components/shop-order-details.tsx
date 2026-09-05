"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ClipboardList, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancelOrder, useShopOrder } from "../use-shop-owner";
import { getGoogleMapsDirectionsUrl } from "@/lib/maps";
export function ShopOrderDetails({ orderId }: { orderId: string }) {
  const t = useTranslations("ShopOwner");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useShopOrder(orderId);
  const cancel = useCancelOrder();
  if (isLoading) return <Skeleton className="h-96 rounded-3xl" />;
  if (isError || !data)
    return (
      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3">
          <ClipboardList />
          <p>{t("orders.details.error")}</p>
          <Button onClick={() => refetch()}>{t("actions.retry")}</Button>
        </CardContent>
      </Card>
    );
  const order = data.order;
  const money = (value: string) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", {
      style: "currency",
      currency: "JOD",
    }).format(Number(value));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <Button
          variant="outline"
          render={<Link href={`/${locale}/shop-owner/orders`} />}
          className="rounded-full"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("orders.details.back")}
        </Button>
        {order.status === "PENDING" && (
          <Button
            variant="destructive"
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(order.id, {
                onSuccess: () => toast.success(t("orders.details.cancelled")),
                onError: () => toast.error(t("orders.details.cancelError")),
              })
            }
          >
            {t("orders.details.cancel")}
          </Button>
        )}
      </div>
      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex justify-between gap-3">
            <div>
              <CardTitle>#{order.id.slice(0, 8)}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.customerName} · {order.customerPhone}
              </p>
            </div>
            <Badge>{t(`statuses.${order.status}`)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [t("orders.details.address"), order.customerAddress],
            [
              t("orders.details.zone"),
              order.deliveryZone ? t(`zones.${order.deliveryZone}`) : "—",
            ],
            [
              t("orders.details.company"),
              order.deliveryCompany?.user.name ?? "—",
            ],
            [t("orders.details.driver"), order.driver?.user.name ?? "—"],
            [t("orders.details.subtotal"), money(order.totalPrice)],
            [t("orders.details.delivery"), money(order.deliveryFee)],
            [t("orders.details.total"), money(order.customerTotal)],
            [t("orders.details.pickup"), order.pickupCode ?? "—"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-muted/45 p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      {order.rejectionReason && (
        <Card className="rounded-3xl border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/20">
          <CardContent className="p-5">
            <p className="text-sm">{order.rejectionReason}</p>
          </CardContent>
        </Card>
      )}
      {order.customerLatitude && order.customerLongitude && (
        <a
          href={getGoogleMapsDirectionsUrl(order.customerLatitude, order.customerLongitude)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          <MapPin className="size-4" />
          {t("orders.details.openMap")}
        </a>
      )}
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>{t("orders.details.items")}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between py-3">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>
                {money(String(Number(item.product.price) * item.quantity))}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
