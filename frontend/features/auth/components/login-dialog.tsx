"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import type { AuthUser, UserRole } from "@/types/auth";

import { getCurrentUser, login } from "../auth-api";
import { loginSchema, type LoginFormValues } from "../login-schema";

const dashboardRoutes: Record<UserRole, string> = {
  ADMIN: "/admin",
  SHOP_OWNER: "/shop",
  DELIVERY_COMPANY: "/company",
  DRIVER: "/driver",
};

interface ApiErrorResponse {
  message?: string | string[];
}

function getErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return "Unable to log in. Please try again.";
  }

  const message = error.response?.data?.message;

  return Array.isArray(message)
    ? message.join(", ")
    : (message ?? "Invalid email or password.");
}

interface LoginDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

export function LoginDialog({
  triggerLabel,
  triggerClassName,
}: LoginDialogProps) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues): Promise<AuthUser> => {
      await login(values);
      return getCurrentUser();
    },
    onSuccess: (user) => {
      toast.success(t("success"));
      setOpen(false);
      reset();
      router.push(dashboardRoutes[user.role]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset();
      setShowPassword(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            className={cn("rounded-full px-6 shadow-sm", triggerClassName)}
          >
            {triggerLabel ?? t("login")}
          </Button>
        }
      />

      <DialogContent className="overflow-hidden border-border/70 p-0 sm:max-w-md">
        <div className="bg-linear-to-br from-primary/15 via-card to-card p-6 sm:p-8">
          <DialogHeader className="text-start">
            <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
              S
            </div>

            <DialogTitle className="text-2xl font-bold tracking-tight">
              {t("title")}
            </DialogTitle>

            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <form
            className="mt-7 space-y-5"
            onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>

              <div className="relative">
                <Mail className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="h-11 ps-10"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="h-11 px-10"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute inset-e-1 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword ? t("hidePassword") : t("showPassword")
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {loginMutation.isPending ? t("loggingIn") : t("login")}
            </Button>

            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              {t("adminNotice")}
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
