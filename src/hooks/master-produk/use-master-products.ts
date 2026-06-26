"use client"

import { useQuery } from "@tanstack/react-query"

import {
  ProductListService,
  type MasterProductsParams,
} from "@/services/master-produk/product-list.service"

export function useMasterProducts(params: MasterProductsParams = {}) {
  return useQuery({
    queryKey: ["master-produk", "list", params],
    queryFn: () => ProductListService.getMasterProducts(params),
    staleTime: 30 * 1000,
  })
}

export function useDownloadedProducts(params: Omit<MasterProductsParams, "status"> = {}) {
  return useQuery({
    queryKey: ["master-produk", "downloaded", params],
    queryFn: () => ProductListService.getDownloadedProducts(params),
    staleTime: 30 * 1000,
  })
}
