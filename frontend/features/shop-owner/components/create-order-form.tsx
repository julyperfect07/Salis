"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  LoaderCircle,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/navigation";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { LocationPicker } from "./location-picker";
import { useCreateOrder, useProducts } from "../use-shop-owner";

const zones = [
  "AMMAN_CENTRAL",
  "AMMAN_WEST",
  "AMMAN_EAST",
  "AMMAN_NORTH",
  "AMMAN_SOUTH",
] as const;

export function CreateOrderForm() {
  const t = useTranslations("ShopOwner");
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading } = useProducts({
    page: 1,
    limit: 100,
    isActive: true,
    sortBy: "name",
    sortOrder: "asc",
  });
  const mutation = useCreateOrder();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [zone, setZone] = useState<(typeof zones)[number]>("AMMAN_CENTRAL");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [cart, setCart] = useState<Record<string, number>>({});
  const products = data?.products ?? [];
  const subtotal = products.reduce(
    (sum, product) => sum + Number(product.price) * (cart[product.id] ?? 0),
    0,
  );
  const money = (value: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", {
      style: "currency",
      currency: "JOD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  const quantity = (id: string, delta: number) =>
    setCart((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + delta),
    }));
  function locate() {
    if (!navigator.geolocation)
      return toast.error(t("orders.create.messages.locationUnavailable"));
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setLocation({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        }),
      () => toast.error(t("orders.create.messages.locationUnavailable")),
      { enableHighAccuracy: true },
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const items = Object.entries(cart)
      .filter(([, count]) => count > 0)
      .map(([productId, count]) => ({ productId, quantity: count }));
    if (!items.length)
      return toast.error(t("orders.create.messages.productsRequired"));
    if (!location)
      return toast.error(t("orders.create.messages.locationRequired"));
    mutation.mutate(
      {
        customerName,
        customerPhone,
        customerAddress,
        customerNote: customerNote || undefined,
        customerLatitude: location.lat,
        customerLongitude: location.lng,
        deliveryZone: zone,
        items,
      },
      {
        onSuccess: (response) => {
          toast.success(t("orders.create.messages.created"));
          router.push(`/shop-owner/orders/${response.order.id}`);
        },
        onError: (error) =>
          toast.error(
            getApiErrorMessage(error, t("orders.create.messages.error")),
          ),
      },
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <div className="space-y-4">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>{t("orders.create.customer")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer-name">{t("orders.create.name")}</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">{t("orders.create.phone")}</Label>
              <Input
                id="customer-phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customer-address">
                {t("orders.create.address")}
              </Label>
              <Input
                id="customer-address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customer-note">{t("orders.create.note")}</Label>
              <Input
                id="customer-note"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-5 text-primary" />
                  {t("orders.create.location")}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("orders.create.mapHint")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 rounded-full"
                onClick={locate}
              >
                <LocateFixed className="size-4" />
                {t("orders.create.useLocation")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={zone}
              onValueChange={(value) => value && setZone(value as typeof zone)}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`zones.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div
              className={
                location
                  ? "rounded-2xl ring-2 ring-primary/30"
                  : "rounded-2xl ring-1 ring-border"
              }
            >
              <LocationPicker value={location} onChange={setLocation} />
            </div>
            {location && (
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
                <MapPin className="size-4" />
                <span>{t("orders.create.locationSelected")}</span>
                <span className="ms-auto font-mono text-xs" dir="ltr">
                  {location.lat}, {location.lng}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="h-fit rounded-3xl xl:sticky xl:top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" />
            {t("orders.create.products")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {money(Number(product.price))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-8 rounded-full"
                      onClick={() => quantity(product.id, -1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center">
                      {cart[product.id] ?? 0}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-8 rounded-full"
                      onClick={() => quantity(product.id, 1)}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-5 flex items-center justify-between border-t pt-4">
            <span className="font-medium">{t("orders.create.subtotal")}</span>
            <span className="text-lg font-semibold">{money(subtotal)}</span>
          </div>
          <Button
            type="submit"
            className="mt-4 w-full rounded-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            {t("orders.create.submit")}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
