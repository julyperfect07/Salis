"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoaderCircle, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useUpdateAdminUser } from "../use-update-admin-user";
import type { AdminUser } from "../users.types";

interface EditUserValues {
  name: string;
  email: string;
  phoneNumber: string;
}

interface EditUserDialogProps {
  user: AdminUser;
}

export function EditUserDialog({ user }: EditUserDialogProps) {
  const t = useTranslations("AdminUsers");
  const [open, setOpen] = useState(false);
  const updateUser = useUpdateAdminUser(user.id);
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t("validation.name")),
        email: z.string().trim().email(t("validation.email")),
        phoneNumber: z.string().trim().min(7, t("validation.phone")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      reset({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    }
  }

  function onSubmit(values: EditUserValues) {
    updateUser.mutate(values, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="rounded-full transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          />
        }
      >
        <Pencil className="size-4" />
        {t("edit.trigger")}
      </DialogTrigger>

      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("edit.title")}</DialogTitle>

          <DialogDescription>{t("edit.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">{t("fields.name")}</Label>

            <Input
              id="edit-name"
              className="rounded-xl"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />

            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">{t("fields.email")}</Label>

            <Input
              id="edit-email"
              type="email"
              className="rounded-xl"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />

            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">{t("fields.phone")}</Label>

            <Input
              id="edit-phone"
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateUser.isPending}
            >
              {t("actions.cancel")}
            </Button>

            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {t("edit.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
