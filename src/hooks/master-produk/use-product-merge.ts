"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  createMutationHook,
  createResourceKeys,
} from "@/hooks/create-crud-hooks";
import { ProductMergeService } from "@/services/master-produk/product-merge.service";
import { STALE_DEFAULT } from "@/lib/query-config";
import type {
  ApplyMergePayload,
  ApplyMergeResult,
  MergeCatalogParams,
} from "@/types/product-merge";

export const mergeKeys = createResourceKeys("product-merge");

const catalogKey = (params: MergeCatalogParams) => [
  ...mergeKeys.all,
  "catalog",
  params,
];
const suggestionsKey = (search: string) => [
  ...mergeKeys.all,
  "suggestions",
  search,
];
const appliedKey = (search: string) => [...mergeKeys.all, "applied", search];

export function useMergeCatalog(params: MergeCatalogParams, enabled = true) {
  return useQuery({
    queryKey: catalogKey(params),
    queryFn: () => ProductMergeService.catalog(params),
    placeholderData: keepPreviousData,
    staleTime: STALE_DEFAULT,
    enabled,
  });
}

export function useMergeSuggestions(search = "", enabled = true) {
  return useQuery({
    queryKey: suggestionsKey(search),
    queryFn: () => ProductMergeService.suggestions(search),
    placeholderData: keepPreviousData,
    staleTime: STALE_DEFAULT,
    enabled,
  });
}

export function useAppliedMerges(search = "", enabled = true) {
  return useQuery({
    queryKey: appliedKey(search),
    queryFn: () => ProductMergeService.applied(search),
    placeholderData: keepPreviousData,
    staleTime: STALE_DEFAULT,
    enabled,
  });
}

export const useApplyMerge = createMutationHook<
  ApplyMergePayload,
  ApplyMergeResult
>({
  mutationFn: (vars) => ProductMergeService.apply(vars),
  successMessage: (data) => `Berhasil menggabungkan ${data.merged} produk`,
  errorMessage: "Gagal menggabungkan produk",
  invalidates: () => [mergeKeys.all, ["master-produk"]],
});

export const useAutoMerge = createMutationHook<
  void,
  { merged: number; groups_affected: number }
>({
  mutationFn: () => ProductMergeService.auto(),
  successMessage: (data) =>
    data.merged > 0
      ? `Berhasil menggabungkan otomatis ${data.merged} produk`
      : "Tidak ada produk baru untuk digabung otomatis",
  errorMessage: "Gagal menggabungkan otomatis",
  invalidates: () => [mergeKeys.all, ["master-produk"]],
});

export const useUnmergeMaster = createMutationHook<string>({
  mutationFn: (masterName) => ProductMergeService.unmergeMaster(masterName),
  successMessage: "Berhasil melepas gabungan",
  errorMessage: "Gagal melepas gabungan",
  invalidates: () => [mergeKeys.all, ["master-produk"]],
});

export const useBulkUnmergeMasters = createMutationHook<string[]>({
  mutationFn: (masterNames) => ProductMergeService.bulkUnmerge(masterNames),
  successMessage: "Berhasil melepas gabungan",
  errorMessage: "Gagal melepas gabungan",
  invalidates: () => [mergeKeys.all, ["master-produk"]],
});

export const useUnmergeProduct = createMutationHook<string>({
  mutationFn: (productId) => ProductMergeService.unmerge(productId),
  successMessage: "Berhasil melepas produk dari master",
  errorMessage: "Gagal melepas produk",
  invalidates: () => [mergeKeys.all, ["master-produk"]],
});

export const useHideMasters = createMutationHook<string[]>({
  mutationFn: (masterNames) => ProductMergeService.hide(masterNames),
  successMessage: "Berhasil menyembunyikan produk",
  errorMessage: "Gagal menyembunyikan produk",
  invalidates: () => [mergeKeys.all, ["master-produk"]],
});

export const useUnhideMasters = createMutationHook<string[]>({
  mutationFn: (masterNames) => ProductMergeService.unhide(masterNames),
  successMessage: "Berhasil menampilkan kembali produk",
  errorMessage: "Gagal menampilkan produk",
  invalidates: () => [mergeKeys.all, ["master-produk"]],
});
