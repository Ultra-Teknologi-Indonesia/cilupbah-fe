"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { InternalStoreService } from "@/services/penjualan/internal-store.service";
import type {
  InternalStoreFormData,
  InternalStoreListParams,
} from "@/types/penjualan/internal-store";

const STALE = 60 * 1000;
const KEY = "internal-store";

export function useInternalStores(params: InternalStoreListParams = {}) {
  return useQuery({
    queryKey: [KEY, "list", params],
    placeholderData: keepPreviousData,
    queryFn: () => InternalStoreService.list(params),
    staleTime: STALE,
  });
}

export function useActiveInternalStores() {
  return useQuery({
    queryKey: [KEY, "all-active"],
    queryFn: () => InternalStoreService.all(),
    staleTime: STALE,
  });
}

export function useInternalStore(id?: string) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => InternalStoreService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  });
}

export function useCreateInternalStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { data: InternalStoreFormData; logo?: File | null }) =>
      InternalStoreService.create(v.data, v.logo ?? null),
    onSuccess: () => {
      toast.success("Toko berhasil ditambahkan");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal menambahkan toko",
      ),
  });
}

export function useUpdateInternalStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      id: string;
      data: Partial<InternalStoreFormData>;
      logo?: File | null;
    }) => InternalStoreService.update(v.id, v.data, v.logo ?? null),
    onSuccess: () => {
      toast.success("Toko berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal memperbarui toko",
      ),
  });
}

export function useDeleteInternalStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => InternalStoreService.delete(id),
    onSuccess: () => {
      toast.success("Toko berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal menghapus toko",
      ),
  });
}

export function useDeleteInternalStoreLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => InternalStoreService.deleteLogo(id),
    onSuccess: () => {
      toast.success("Logo dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal menghapus logo",
      ),
  });
}
