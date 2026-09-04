"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authQueryKey } from "@/features/auth/use-current-user";
import { changePassword, getProfile, updateDeliveryProfile, updateProfile, uploadAvatar } from "./profile-api";

export const profileQueryKey = ["profile"] as const;

export function useProfile() {
  return useQuery({ queryKey: profileQueryKey, queryFn: getProfile });
}

export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      client.setQueryData(authQueryKey, response.user);
      client.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}

export function useUploadAvatar() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (response) => {
      client.setQueryData(authQueryKey, response.user);
      client.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}

export function useUpdateDeliveryProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateDeliveryProfile,
    onSuccess: () => client.invalidateQueries({ queryKey: profileQueryKey }),
  });
}
