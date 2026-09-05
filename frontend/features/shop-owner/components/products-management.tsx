"use client";

import { useDeferredValue, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import type { Product } from "../shop-owner.types";
import { useProductMutations, useProducts } from "../use-shop-owner";

/* eslint-disable @next/next/no-img-element -- product URLs may be legacy external images */
function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        <Package className="size-9 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
/* eslint-enable @next/next/no-img-element */

function ProductDialog({ product }: { product?: Product }) {
  const t = useTranslations("ShopOwner");
  const { create, update, upload } = useProductMutations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [imageUrls, setImageUrls] = useState(product?.imageUrls ?? []);
  const mutation = product ? update : create;

  async function images(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 5);
    event.target.value = "";
    if (!files.length) return;
    if (
      files.some(
        (file) =>
          file.size > 5 * 1024 * 1024 ||
          !["image/jpeg", "image/png", "image/webp"].includes(file.type),
      )
    )
      return toast.error(t("products.messages.imageInvalid"));
    try {
      const response = await upload.mutateAsync(files);
      setImageUrls((current) =>
        [...current, ...response.imageUrls].slice(0, 5),
      );
      toast.success(t("products.messages.imagesUploaded"));
    } catch {
      toast.error(t("products.messages.uploadError"));
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const input = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      imageUrls,
    };
    const options = {
      onSuccess: () => {
        toast.success(
          t(
            product ? "products.messages.updated" : "products.messages.created",
          ),
        );
        setOpen(false);
      },
      onError: () => toast.error(t("products.messages.saveError")),
    };
    if (product) update.mutate({ id: product.id, input }, options);
    else create.mutate(input, options);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={product ? "outline" : "default"}
            size={product ? "sm" : "default"}
            className="rounded-full"
          />
        }
      >
        {product ? <Pencil className="size-4" /> : <Plus className="size-4" />}
        {t(product ? "products.edit" : "products.create")}
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {t(product ? "products.edit" : "products.create")}
          </DialogTitle>
          <DialogDescription>{t("products.formDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${product?.id ?? "new"}`}>
              {t("products.name")}
            </Label>
            <Input
              id={`name-${product?.id ?? "new"}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`description-${product?.id ?? "new"}`}>
              {t("products.description")}
            </Label>
            <Input
              id={`description-${product?.id ?? "new"}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`price-${product?.id ?? "new"}`}>
              {t("products.price")}
            </Label>
            <Input
              id={`price-${product?.id ?? "new"}`}
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("products.images")}</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed p-5 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
              {upload.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {t("products.uploadImages")}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={images}
                className="sr-only"
              />
            </label>
            {imageUrls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {imageUrls.map((url) => (
                  <div key={url} className="relative shrink-0">
                    <ProductImage
                      src={url}
                      alt=""
                      className="size-20 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImageUrls((current) =>
                          current.filter((image) => image !== url),
                        )
                      }
                      className="absolute -end-1 -top-1 flex size-6 items-center justify-center rounded-full bg-destructive text-white"
                      aria-label={t("products.removeImage")}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || upload.isPending}
            >
              {mutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {t("actions.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProductsManagement() {
  const t = useTranslations("ShopOwner");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [active, setActive] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"createdAt" | "name" | "price">("createdAt");
  const { data, isLoading, isError, refetch } = useProducts({
    page,
    limit: 9,
    search: deferred || undefined,
    isActive: active,
    sortBy: sort,
    sortOrder: sort === "name" ? "asc" : "desc",
  });
  const { active: activeMutation } = useProductMutations();
  const reduceMotion = useReducedMotion();
  const money = (value: string) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", {
      style: "currency",
      currency: "JOD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("products.search")}
              className="h-10 rounded-full ps-9"
            />
          </div>
          <Select
            value={active ? "active" : "archived"}
            onValueChange={(value) => {
              setActive(value === "active");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full rounded-full lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("products.active")}</SelectItem>
              <SelectItem value="archived">{t("products.archived")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              if (value) {
                setSort(value as typeof sort);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="w-full rounded-full lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">
                {t("products.sortNewest")}
              </SelectItem>
              <SelectItem value="name">{t("products.sortName")}</SelectItem>
              <SelectItem value="price">{t("products.sortPrice")}</SelectItem>
            </SelectContent>
          </Select>
          <ProductDialog />
        </div>
      </div>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-3xl" />
          ))}
        </div>
      ) : isError || !data ? (
        <Card className="rounded-3xl">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3">
            <Package className="size-9 text-destructive" />
            <p>{t("products.error")}</p>
            <Button onClick={() => refetch()}>{t("actions.retry")}</Button>
          </CardContent>
        </Card>
      ) : data.products.length === 0 ? (
        <Card className="rounded-3xl">
          <CardContent className="flex min-h-64 flex-col items-center justify-center">
            <Package className="size-9 text-primary" />
            <p className="mt-3 font-medium">{t("products.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: reduceMotion ? 0 : index * 0.045,
                }}
                whileHover={reduceMotion ? undefined : { y: -5 }}
              >
                <Card className="group h-full overflow-hidden rounded-3xl border-border/70 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <div className="relative h-52 overflow-hidden bg-linear-to-br from-primary/10 via-muted to-muted">
                    {product.imageUrls[0] ? (
                      <ProductImage
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="size-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-black/5 opacity-70 transition-opacity group-hover:opacity-90" />
                    <Badge className="absolute start-3 top-3 gap-1.5 rounded-full border-white/15 bg-background/90 text-foreground shadow-sm backdrop-blur-md hover:bg-background/90">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          product.isActive
                            ? "bg-primary"
                            : "bg-muted-foreground",
                        )}
                      />
                      {t(
                        product.isActive
                          ? "products.active"
                          : "products.archived",
                      )}
                    </Badge>
                    <Badge className="absolute end-3 top-3 rounded-full shadow-lg shadow-black/10">
                      {money(product.price)}
                    </Badge>
                    {product.imageUrls.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2 py-1.5 backdrop-blur-sm">
                        {product.imageUrls.map((image, imageIndex) => (
                          <span
                            key={`${image}-${imageIndex}`}
                            className={cn(
                              "size-1.5 rounded-full bg-white/55",
                              imageIndex === 0 && "w-4 bg-white",
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                      {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                      {product.description || t("products.noDescription")}
                    </p>
                    <div className="mt-5 flex gap-2 border-t pt-4">
                      <ProductDialog product={product} />
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={activeMutation.isPending}
                        onClick={() => {
                          if (
                            !product.isActive ||
                            window.confirm(t("products.archiveConfirm"))
                          )
                            activeMutation.mutate(
                              { id: product.id, active: !product.isActive },
                              {
                                onSuccess: () =>
                                  toast.success(
                                    t(
                                      product.isActive
                                        ? "products.messages.archived"
                                        : "products.messages.restored",
                                    ),
                                  ),
                              },
                            );
                        }}
                      >
                        <ArchiveRestore className="size-4" />
                        {t(
                          product.isActive
                            ? "products.archive"
                            : "products.restore",
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-full border bg-card px-4 py-2">
            <p className="text-sm text-muted-foreground">
              {t("products.showing", {
                shown: data.products.length,
                total: data.pagination.total,
              })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="rtl:rotate-180" />
              </Button>
              <span className="min-w-16 text-center text-sm">
                {page} / {Math.max(data.pagination.totalPages, 1)}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
