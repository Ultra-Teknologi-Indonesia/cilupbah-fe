"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { AuthService } from "@/services/auth/auth.service";
import { clearLoginSession } from "@/app/actions/auth.actions";
import type { LoginRequest } from "@/types/auth/auth.types";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => AuthService.profile(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (values: LoginRequest) => AuthService.login(values),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      try {
        await AuthService.logout();
      } catch {}
      await clearLoginSession();
      window.location.href = "/login?logout=success";
    },
  });
}
