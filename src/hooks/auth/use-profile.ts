"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { createResourceKeys } from "@/hooks/create-crud-hooks";
import { AuthService, type HistoryParams } from "@/services/auth/auth.service";
import type {
  ChangePasswordPayload,
  MyProfile,
  UpdateProfilePayload,
} from "@/types/auth/auth.types";

export const profileKeys = createResourceKeys("profile");
export const sessionsKey = ["profile", "sessions"] as const;
export const historiesKey = (params: HistoryParams) =>
  ["profile", "histories", params] as const;
export const loginHistoriesKey = (params: HistoryParams) =>
  ["profile", "login-histories", params] as const;

function toastError(err: unknown, fallback: string) {
  const message = (err as { message?: string })?.message;
  toast.error(message || fallback);
}

function syncMe(qc: ReturnType<typeof useQueryClient>, user: MyProfile) {
  qc.setQueryData(["me"], user);
  qc.invalidateQueries({ queryKey: profileKeys.all });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      AuthService.updateProfile(payload),
    onSuccess: (user) => {
      toast.success("Berhasil menyimpan profil");
      syncMe(qc, user);
    },
    onError: (err) => toastError(err, "Gagal menyimpan profil"),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      AuthService.changePassword(payload),
    onSuccess: () => toast.success("Berhasil mengubah kata sandi"),
    onError: (err) => toastError(err, "Gagal mengubah kata sandi"),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const media = await AuthService.uploadMedia(file);
      return AuthService.updateAvatar(media.uuid);
    },
    onSuccess: (user) => {
      toast.success("Berhasil memperbarui foto profil");
      syncMe(qc, user);
    },
    onError: (err) => toastError(err, "Gagal memperbarui foto profil"),
  });
}

export function useRemoveAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => AuthService.updateAvatar(null),
    onSuccess: (user) => {
      toast.success("Foto profil dihapus");
      syncMe(qc, user);
    },
    onError: (err) => toastError(err, "Gagal menghapus foto profil"),
  });
}

export function useMySessions() {
  return useQuery({
    queryKey: sessionsKey,
    queryFn: () => AuthService.sessions(),
    staleTime: 30_000,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AuthService.revokeSession(id),
    onSuccess: () => {
      toast.success("Berhasil mencabut sesi");
      qc.invalidateQueries({ queryKey: sessionsKey });
    },
    onError: (err) => toastError(err, "Gagal mencabut sesi"),
  });
}

export function useRevokeOtherSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => AuthService.revokeOtherSessions(),
    onSuccess: (count) => {
      toast.success(
        count > 0
          ? `Berhasil mencabut ${count} sesi lain`
          : "Tidak ada sesi lain untuk dicabut",
      );
      qc.invalidateQueries({ queryKey: sessionsKey });
    },
    onError: (err) => toastError(err, "Gagal mencabut sesi"),
  });
}

export function useMyHistories(params: HistoryParams) {
  return useQuery({
    queryKey: historiesKey(params),
    queryFn: () => AuthService.myHistories(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useMyLoginHistories(params: HistoryParams) {
  return useQuery({
    queryKey: loginHistoriesKey(params),
    queryFn: () => AuthService.myLoginHistories(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
