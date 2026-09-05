"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Camera,
  LoaderCircle,
  LockKeyhole,
  Save,
  Truck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  AdminUserDetails,
  DeliveryZone,
} from "@/features/admin/users.types";
import {
  useChangePassword,
  useProfile,
  useUpdateDeliveryProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "../use-profile";

const zones: DeliveryZone[] = [
  "AMMAN_CENTRAL",
  "AMMAN_WEST",
  "AMMAN_EAST",
  "AMMAN_NORTH",
  "AMMAN_SOUTH",
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function BasicProfileForm({ user }: { user: AdminUserDetails }) {
  const t = useTranslations("Profile");
  const mutation = useUpdateProfile();
  const avatarMutation = useUploadAvatar();
  const [name, setName] = useState(user.name);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    mutation.mutate(
      { name: name.trim(), phoneNumber: phoneNumber.trim() },
      {
        onSuccess: () => toast.success(t("messages.profileSaved")),
        onError: () => toast.error(t("messages.profileError")),
      },
    );
  }

  function handleAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return toast.error(t("messages.avatarType"));
    if (file.size > 2 * 1024 * 1024)
      return toast.error(t("messages.avatarSize"));
    avatarMutation.mutate(file, {
      onSuccess: () => toast.success(t("messages.avatarSaved")),
      onError: () => toast.error(t("messages.avatarError")),
    });
  }

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-5 text-primary" />
          {t("account.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <Avatar className="size-16">
              <AvatarImage src={user.imageUrl ?? undefined} alt={name} />
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -end-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
              aria-label={t("account.uploadAvatar")}
            >
              {avatarMutation.isPending ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatar}
                disabled={avatarMutation.isPending}
                className="sr-only"
              />
            </label>
          </div>
          <div>
            <p className="font-semibold">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              {t(`roles.${user.role}`)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("account.avatarHint")}
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">{t("account.name")}</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">{t("account.phone")}</Label>
            <Input
              id="profile-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              minLength={7}
              required
              className="rounded-xl"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {t("actions.save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const t = useTranslations("Profile");
  const mutation = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword)
      return toast.error(t("messages.passwordMismatch"));
    mutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success(t("messages.passwordSaved"));
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: () => toast.error(t("messages.passwordError")),
      },
    );
  }

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockKeyhole className="size-5 text-primary" />
          {t("password.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t("password.current")}</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-new-password">{t("password.new")}</Label>
            <Input
              id="profile-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-confirm-password">
              {t("password.confirm")}
            </Label>
            <Input
              id="profile-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            {t("actions.changePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DeliveryProfileForm({ user }: { user: AdminUserDetails }) {
  const t = useTranslations("Profile");
  const company = user.deliveryCompany!;
  const mutation = useUpdateDeliveryProfile();
  const [deliveryPrice, setDeliveryPrice] = useState(company.deliveryPrice);
  const [openTime, setOpenTime] = useState(company.openTime);
  const [closeTime, setCloseTime] = useState(company.closeTime);
  const [coverageZones, setCoverageZones] = useState<DeliveryZone[]>(
    company.coverageZones as DeliveryZone[],
  );

  function submit(event: React.FormEvent) {
    event.preventDefault();
    mutation.mutate(
      {
        deliveryPrice: Number(deliveryPrice),
        openTime,
        closeTime,
        coverageZones,
      },
      {
        onSuccess: () => toast.success(t("messages.deliverySaved")),
        onError: () => toast.error(t("messages.deliveryError")),
      },
    );
  }

  return (
    <Card className="rounded-3xl lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="size-5 text-primary" />
          {t("delivery.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="delivery-price">{t("delivery.price")}</Label>
            <Input
              id="delivery-price"
              type="number"
              min="0.001"
              step="0.001"
              value={deliveryPrice}
              onChange={(e) => setDeliveryPrice(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="open-time">{t("delivery.open")}</Label>
            <Input
              id="open-time"
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="close-time">{t("delivery.close")}</Label>
            <Input
              id="close-time"
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <fieldset className="space-y-3 sm:col-span-3">
            <legend className="text-sm font-medium">
              {t("delivery.zones")}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {zones.map((zone) => (
                <label
                  key={zone}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  <Checkbox
                    checked={coverageZones.includes(zone)}
                    onCheckedChange={(checked) =>
                      setCoverageZones((current) =>
                        checked === true
                          ? [...current, zone]
                          : current.filter((item) => item !== zone),
                      )
                    }
                  />
                  <span className="text-sm">{t(`zones.${zone}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={mutation.isPending || coverageZones.length === 0}>
              {mutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {t("actions.saveDelivery")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ProfileManagement() {
  const t = useTranslations("Profile");
  const { data, isLoading, isError, refetch } = useProfile();
  if (isLoading)
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  if (isError || !data)
    return (
      <Card className="rounded-3xl">
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
          <UserRound className="size-10 text-destructive" />
          <div>
            <h2 className="font-semibold">{t("error.title")}</h2>
            <p className="mt-1 text-muted-foreground">
              {t("error.description")}
            </p>
          </div>
          <Button onClick={() => refetch()}>{t("actions.retry")}</Button>
        </CardContent>
      </Card>
    );
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BasicProfileForm
        key={`${data.user.id}-${data.user.updatedAt}`}
        user={data.user}
      />
      <PasswordForm />
      {data.user.role === "DELIVERY_COMPANY" && data.user.deliveryCompany && (
        <DeliveryProfileForm key={data.user.updatedAt} user={data.user} />
      )}
    </div>
  );
}
