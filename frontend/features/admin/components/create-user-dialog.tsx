"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoaderCircle, Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useCreateUser } from "../use-create-user";
import type { CreateUserInput, DeliveryZone } from "../users.types";

const creatableRoles = ["SHOP_OWNER", "DELIVERY_COMPANY", "ADMIN"] as const;

type CreatableRole = (typeof creatableRoles)[number];

const deliveryZones: DeliveryZone[] = [
  "AMMAN_CENTRAL",
  "AMMAN_WEST",
  "AMMAN_EAST",
  "AMMAN_NORTH",
  "AMMAN_SOUTH",
];

interface CreateUserValues {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: CreatableRole;
  deliveryPrice?: string;
  openTime?: string;
  closeTime?: string;
  coverageZones: DeliveryZone[];
}

const defaultValues: CreateUserValues = {
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  role: "SHOP_OWNER",
  deliveryPrice: "",
  openTime: "",
  closeTime: "",
  coverageZones: [],
};

export function CreateUserDialog() {
  const t = useTranslations("AdminUsers");
  const [open, setOpen] = useState(false);
  const createUser = useCreateUser();

  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(2, t("validation.name")),

          email: z.string().trim().email(t("validation.email")),

          password: z.string().min(8, t("validation.password")),

          phoneNumber: z.string().trim().min(7, t("validation.phone")),

          role: z.enum(creatableRoles),

          deliveryPrice: z.string().trim().optional(),

          openTime: z.string().trim().optional(),

          closeTime: z.string().trim().optional(),

          coverageZones: z.array(
            z.enum([
              "AMMAN_CENTRAL",
              "AMMAN_WEST",
              "AMMAN_EAST",
              "AMMAN_NORTH",
              "AMMAN_SOUTH",
            ]),
          ),
        })
        .superRefine((values, context) => {
          if (values.role !== "DELIVERY_COMPANY") {
            return;
          }

          const deliveryPrice = Number(values.deliveryPrice);

          if (
            !values.deliveryPrice ||
            Number.isNaN(deliveryPrice) ||
            deliveryPrice <= 0
          ) {
            context.addIssue({
              code: "custom",
              path: ["deliveryPrice"],
              message: t("validation.deliveryPrice"),
            });
          }

          if (!values.openTime) {
            context.addIssue({
              code: "custom",
              path: ["openTime"],
              message: t("validation.openTime"),
            });
          }

          if (!values.closeTime) {
            context.addIssue({
              code: "custom",
              path: ["closeTime"],
              message: t("validation.closeTime"),
            });
          }

          if (values.coverageZones.length === 0) {
            context.addIssue({
              code: "custom",
              path: ["coverageZones"],
              message: t("validation.coverageZones"),
            });
          }
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedRole = watch("role");
  const selectedZones = watch("coverageZones");

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset(defaultValues);
    }
  }

  function handleRoleChange(value: string | null) {
    if (!value) {
      return;
    }

    setValue("role", value as CreatableRole, {
      shouldValidate: true,
    });

    setValue("deliveryPrice", "");
    setValue("openTime", "");
    setValue("closeTime", "");
    setValue("coverageZones", []);
  }

  function handleZoneChange(zone: DeliveryZone, checked: boolean) {
    const nextZones = checked
      ? [...selectedZones, zone]
      : selectedZones.filter((selectedZone) => selectedZone !== zone);

    setValue("coverageZones", nextZones, {
      shouldValidate: true,
    });
  }

  function onSubmit(values: CreateUserValues) {
    const input: CreateUserInput = {
      name: values.name,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber,
      role: values.role,
    };

    if (values.role === "DELIVERY_COMPANY") {
      input.deliveryPrice = Number(values.deliveryPrice);

      input.openTime = values.openTime;
      input.closeTime = values.closeTime;
      input.coverageZones = values.coverageZones;
    }

    createUser.mutate(input, {
      onSuccess: () => {
        setOpen(false);
        reset(defaultValues);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            className="h-10 rounded-full px-5 shadow-md shadow-primary/15 transition-transform duration-200 active:scale-95"
          />
        }
      >
        <Plus className="size-4" />
        {t("create.trigger")}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-xl">
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="size-5" />
          </div>

          <DialogTitle>{t("create.title")}</DialogTitle>

          <DialogDescription>{t("create.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="create-role">{t("fields.role")}</Label>

            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger id="create-role" className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="SHOP_OWNER">
                  {t("roles.SHOP_OWNER")}
                </SelectItem>

                <SelectItem value="DELIVERY_COMPANY">
                  {t("roles.DELIVERY_COMPANY")}
                </SelectItem>

                <SelectItem value="ADMIN">{t("roles.ADMIN")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">{t("fields.name")}</Label>

              <Input
                id="create-name"
                placeholder={t("placeholders.name")}
                className="rounded-xl"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />

              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-phone">{t("fields.phone")}</Label>

              <Input
                id="create-phone"
                placeholder="0790000000"
                className="rounded-xl"
                aria-invalid={Boolean(errors.phoneNumber)}
                {...register("phoneNumber")}
              />

              {errors.phoneNumber && (
                <p className="text-xs text-destructive">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">{t("fields.email")}</Label>

            <Input
              id="create-email"
              type="email"
              placeholder="account@example.com"
              className="rounded-xl"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />

            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-password">{t("fields.password")}</Label>

            <Input
              id="create-password"
              type="password"
              autoComplete="new-password"
              placeholder={t("placeholders.password")}
              className="rounded-xl"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />

            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {selectedRole === "DELIVERY_COMPANY" && (
            <div className="space-y-4 rounded-2xl border bg-muted/30 p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="delivery-price">
                    {t("fields.deliveryPrice")}
                  </Label>

                  <Input
                    id="delivery-price"
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="2.500"
                    className="rounded-xl bg-background"
                    aria-invalid={Boolean(errors.deliveryPrice)}
                    {...register("deliveryPrice")}
                  />

                  {errors.deliveryPrice && (
                    <p className="text-xs text-destructive">
                      {errors.deliveryPrice.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="open-time">{t("fields.openTime")}</Label>

                  <Input
                    id="open-time"
                    type="time"
                    className="rounded-xl bg-background"
                    aria-invalid={Boolean(errors.openTime)}
                    {...register("openTime")}
                  />

                  {errors.openTime && (
                    <p className="text-xs text-destructive">
                      {errors.openTime.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="close-time">{t("fields.closeTime")}</Label>

                  <Input
                    id="close-time"
                    type="time"
                    className="rounded-xl bg-background"
                    aria-invalid={Boolean(errors.closeTime)}
                    {...register("closeTime")}
                  />

                  {errors.closeTime && (
                    <p className="text-xs text-destructive">
                      {errors.closeTime.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t("fields.coverageZones")}</Label>

                <div className="grid gap-2 sm:grid-cols-2">
                  {deliveryZones.map((zone) => (
                    <label
                      key={zone}
                      htmlFor={zone}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                    >
                      <Checkbox
                        id={zone}
                        checked={selectedZones.includes(zone)}
                        onCheckedChange={(checked) =>
                          handleZoneChange(zone, checked === true)
                        }
                      />

                      <span className="text-sm font-medium">
                        {t(`zones.${zone}`)}
                      </span>
                    </label>
                  ))}
                </div>

                {errors.coverageZones && (
                  <p className="text-xs text-destructive">
                    {errors.coverageZones.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createUser.isPending}
            >
              {t("actions.cancel")}
            </Button>

            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}

              {t("actions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
