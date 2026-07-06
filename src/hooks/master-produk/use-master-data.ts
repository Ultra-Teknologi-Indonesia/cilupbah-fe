"use client";

import { useQuery } from "@tanstack/react-query";

import { MasterDataService } from "@/services/master-produk/master-data.service";

const STALE = 5 * 60 * 1000;

function useMasterDataQuery<T>(key: string, queryFn: () => Promise<T>) {
  return useQuery({
    queryKey: ["master-produk", "lookup", key],
    queryFn,
    staleTime: STALE,
  });
}

export const useCategoryTree = () =>
  useMasterDataQuery("categories", MasterDataService.categoryTree);

export const useCategoryFormAttributes = (
  categoryId?: string | number | null,
) =>
  useQuery({
    queryKey: ["master-produk", "category-attributes", categoryId],
    queryFn: () => MasterDataService.categoryFormAttributes(categoryId!),
    enabled: categoryId != null && categoryId !== "",
    staleTime: STALE,
    retry: false,
  });
