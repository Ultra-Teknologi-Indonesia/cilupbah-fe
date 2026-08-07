"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { AuthService } from "@/services/auth/auth.service";
import {
  clearLoginSession,
  loginServerSide,
} from "@/app/actions/auth.actions";
import type {
  ForgotPasswordPayload,
  LoginRequest,
  ResetPasswordPayload,
  VerifyResetOtpPayload,
} from "@/types/auth/auth.types";

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
    mutationFn: async (values: LoginRequest) => {
      const result = await loginServerSide(values);
      if (!result.ok) throw result.error;
      return result.user;
    },
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

export function useUnlock() {
  return useMutation({
    mutationFn: (password: string) => AuthService.unlock(password),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      AuthService.forgotPassword(payload),
  });
}

export function useVerifyResetOtp() {
  return useMutation({
    mutationFn: (payload: VerifyResetOtpPayload) =>
      AuthService.verifyResetOtp(payload),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      AuthService.resetPassword(payload),
  });
}
