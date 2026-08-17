"use client";

import {
  useInfiniteQuery,
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";

import {
  ProductListService,
  type MasterProductsParams,
} from "@/services/master-produk/product-list.service";

export function useMasterProducts(params: MasterProductsParams = {}) {
  return useQuery({
    queryKey: ["master-produk", "list", params],
    placeholderData: keepPreviousData,
    queryFn: () => ProductListService.getMasterProducts(params),
    staleTime: 30 * 1000,
  });
}

export function useInfiniteMasterProducts(
  params: Omit<MasterProductsParams, "page"> = {},
  options: { enabled?: boolean } = {},
) {
  return useInfiniteQuery({
    queryKey: ["master-produk", "infinite", params],
    queryFn: ({ pageParam }) =>
      ProductListService.getMasterProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    staleTime: 30 * 1000,
    enabled: options.enabled ?? true,
  });
}

export function useDownloadedProducts(
  params: Omit<MasterProductsParams, "status"> = {},
) {
  return useQuery({
    queryKey: ["master-produk", "downloaded", params],
    queryFn: () => ProductListService.getDownloadedProducts(params),
    staleTime: 30 * 1000,
  });
}

export function usePickerProducts(
  params: MasterProductsParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["products-picker", params],
    placeholderData: keepPreviousData,
    queryFn: () => ProductListService.getPickerProducts(params),
    staleTime: 30 * 1000,
    enabled: options.enabled ?? true,
  });
}

