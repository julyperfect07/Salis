"use client";

import { LoaderCircle, Power } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpdateUserStatus } from "../use-update-user-status";
import type { AdminUser } from "../users.types";

interface UserStatusDialogProps {
  user: AdminUser;
}

export function UserStatusDialog({ user }: UserStatusDialogProps) {
  const t = useTranslations("AdminUsers");
  const updateStatus = useUpdateUserStatus();
  const newStatus = !user.isActive;

  function handleStatusUpdate() {
    updateStatus.mutate({
      userId: user.id,
      isActive: newStatus,
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full transition-all duration-200",
              user.isActive
                ? "border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                : "border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
            )}
          />
        }
      >
        <Power className="size-3.5" />

        {user.isActive
          ? t("statusDialog.deactivate")
          : t("statusDialog.activate")}
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <div
            className={cn(
              "mb-2 flex size-11 items-center justify-center rounded-full",
              user.isActive
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary",
            )}
          >
            <Power className="size-5" />
          </div>

          <AlertDialogTitle>
            {user.isActive
              ? t("statusDialog.deactivateTitle")
              : t("statusDialog.activateTitle")}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {user.isActive
              ? t("statusDialog.deactivateDescription", { name: user.name })
              : t("statusDialog.activateDescription", { name: user.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateStatus.isPending}>
            {t("actions.cancel")}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleStatusUpdate}
            disabled={updateStatus.isPending}
            className={cn(
              "transition-transform duration-200 active:scale-95",
              user.isActive
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {updateStatus.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}

            {user.isActive
              ? t("statusDialog.deactivate")
              : t("statusDialog.activate")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
