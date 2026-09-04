"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyRound, LoaderCircle } from "lucide-react";

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
import { useResetUserPassword } from "../use-reset-user-password";
import type { AdminUser } from "../users.types";

interface ResetPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordDialogProps {
  user: AdminUser;
}

export function ResetPasswordDialog({ user }: ResetPasswordDialogProps) {
  const t = useTranslations("AdminUsers");
  const [open, setOpen] = useState(false);
  const resetPassword = useResetUserPassword(user.id);
  const schema = useMemo(
    () =>
      z
        .object({
          newPassword: z.string().min(8, t("validation.password")),
          confirmPassword: z.string().min(1, t("validation.confirmPassword")),
        })
        .refine((values) => values.newPassword === values.confirmPassword, {
          message: t("validation.passwordMismatch"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      reset({
        newPassword: "",
        confirmPassword: "",
      });
    }
  }

  function onSubmit(values: ResetPasswordValues) {
    resetPassword.mutate(values.newPassword, {
      onSuccess: () => {
        setOpen(false);
        reset();
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
            className="rounded-full transition-all duration-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:border-amber-900 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
          />
        }
      >
        <KeyRound className="size-4" />
        {t("resetPassword.trigger")}
      </DialogTrigger>

      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <KeyRound className="size-5" />
          </div>

          <DialogTitle>{t("resetPassword.title")}</DialogTitle>

          <DialogDescription>
            {t("resetPassword.description", { name: user.name })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">
              {t("resetPassword.newPassword")}
            </Label>

            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              className="rounded-xl"
              aria-invalid={Boolean(errors.newPassword)}
              {...register("newPassword")}
            />

            {errors.newPassword && (
              <p className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              {t("resetPassword.confirmPassword")}
            </Label>

            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className="rounded-xl"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />

            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={resetPassword.isPending}
            >
              {t("actions.cancel")}
            </Button>

            <Button type="submit" disabled={resetPassword.isPending}>
              {resetPassword.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {t("resetPassword.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
