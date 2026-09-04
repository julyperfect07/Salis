"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { resetUserPassword } from "./users-api";

export function useResetUserPassword(userId: string) {
  return useMutation({
    mutationFn: (newPassword: string) =>
      resetUserPassword(userId, {
        newPassword,
      }),

    onSuccess: (response) => {
      toast.success(response.message);
    },

    onError: () => {
      toast.error("Could not reset the password");
    },
  });
}
