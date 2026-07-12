"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { apiError } from "@/lib/toast";
import { NotificationService } from "@/services/notification/notification.service";
import type { NotificationListParams } from "@/types/notification";

const KEYS = {
  all: ["notifications"] as const,
  list: (params: NotificationListParams) =>
    [...KEYS.all, "list", params] as const,
  unreadCount: () => [...KEYS.all, "unread-count"] as const,
};

export function useNotifications(params: NotificationListParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => NotificationService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: KEYS.unreadCount(),
    queryFn: () => NotificationService.unreadCount(),
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NotificationService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
    onError: (err) => {
      apiError(err, "Gagal menandai notifikasi.");
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Berhasil menandai semua notifikasi dibaca");
    },
    onError: (err) => {
      apiError(err, "Gagal menandai semua notifikasi.");
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NotificationService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Berhasil menghapus notifikasi");
    },
    onError: (err) => {
      apiError(err, "Gagal menghapus notifikasi.");
    },
  });
}
