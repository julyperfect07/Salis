"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateAdminUser } from "./users-api";
import type { UpdateAdminUserInput } from "./users.types";

export function useUpdateAdminUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdminUserInput) => updateAdminUser(userId, input),

    onSuccess: (response) => {
      toast.success(response.message);

      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "users", userId],
      });
    },

    onError: () => {
      toast.error("Could not update the user");
    },
  });
}
