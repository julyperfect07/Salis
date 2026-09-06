"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { createUser } from "./users-api";
import type { CreateUserInput } from "./users.types";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),

    onSuccess: () => {
      toast.success("Account created successfully");

      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });
    },

    onError: (error) => {
      const message =
        error instanceof AxiosError &&
        typeof (error.response?.data as { message?: unknown } | undefined)
          ?.message === "string"
          ? (error.response?.data as { message: string }).message
          : "Could not create the account";

      toast.error(message);
    },
  });
}
