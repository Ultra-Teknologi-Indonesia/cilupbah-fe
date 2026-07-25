"use client";

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { apiError } from "@/lib/toast";
import { LocationBinService } from "@/services/manajemen-rak/location-bin.service";
import type {
  BinListParams,
  GenerateBinsPayload,
  UniformApplyPayload,
} from "@/types/manajemen-rak/location";

export const locationBinKeys = {
  all: ["location-bins"] as const,
  list: (locationId: string, params: BinListParams) =>
    ["location-bins", "list", locationId, params] as const,
  preview: (
    locationId: string,
    payload: GenerateBinsPayload,
    page: number,
    perPage: number,
  ) =>
    ["location-bins", "preview", locationId, payload, page, perPage] as const,
};

export function useLocationBins(
  locationId: string | undefined,
  params: BinListParams = {},
) {
  return useQuery({
    queryKey: locationBinKeys.list(locationId ?? "", params),
    queryFn: () => LocationBinService.list(locationId!, params),
    enabled: !!locationId,
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
}

export function useLocationBinsInfinite(
  locationId: string | undefined,
  params: Omit<BinListParams, "page"> = {},
) {
  return useInfiniteQuery({
    queryKey: ["location-bins", "infinite", locationId ?? "", params] as const,
    queryFn: ({ pageParam }) =>
      LocationBinService.list(locationId!, { ...params, page: pageParam }),
    enabled: !!locationId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    // Halaman yang sudah di-fetch tetap tersimpan; scroll ke atas tak fetch
    // ulang. Refetch hanya saat query key berubah (mis. teks pencarian).
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function usePreviewBins(
  locationId: string | undefined,
  payload: GenerateBinsPayload | null,
  page: number,
  perPage: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: locationBinKeys.preview(
      locationId ?? "",
      payload as GenerateBinsPayload,
      page,
      perPage,
    ),
    queryFn: () =>
      LocationBinService.preview(locationId!, payload!, page, perPage),
    enabled: enabled && !!locationId && !!payload,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useMoveSkuBin(locationId?: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      sourceBinId: string;
      itemId: string;
      destinationBinId: string;
    }) => {
      if (!locationId) throw new Error("locationId is required");
      return LocationBinService.moveSku(
        locationId,
        vars.sourceBinId,
        vars.itemId,
        vars.destinationBinId,
      );
    },
    onSuccess: (data) => {
      toast.success(`${data.moved_qty} stok berhasil dipindah ke rak tujuan`);
      qc.invalidateQueries({ queryKey: locationBinKeys.all });
    },
    onError: (err) => apiError(err, "Gagal memindahkan SKU"),
  });
}

export function useRemoveSkuBin(locationId?: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { binId: string; itemId: string }) => {
      if (!locationId) throw new Error("locationId is required");
      return LocationBinService.removeSku(locationId, vars.binId, vars.itemId);
    },
    onSuccess: (data) => {
      toast.success(
        data.removed_qty > 0
          ? `SKU dikeluarkan, ${data.removed_qty} stok disesuaikan jadi 0`
          : "SKU berhasil dikeluarkan dari rak",
      );
      qc.invalidateQueries({ queryKey: locationBinKeys.all });
    },
    onError: (err) => apiError(err, "Gagal mengeluarkan SKU"),
  });
}

export function useUniformApplyBins(locationId?: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UniformApplyPayload) => {
      if (!locationId) throw new Error("locationId is required");
      return LocationBinService.uniformApply(locationId, payload);
    },
    onSuccess: (data) => {
      toast.success(`${data.affected} rak berhasil diperbarui`);
      qc.invalidateQueries({ queryKey: locationBinKeys.all });
    },
    onError: (err) => apiError(err, "Gagal seragamkan rak"),
  });
}
