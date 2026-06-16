"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  ProductTabsService,
  type BulkVariantAction,
  type ChannelTabParams,
  type PriceBookParams,
  type UploadHistoryParams,
  type VariantsParams,
} from "@/services/master-produk/product-tabs.service"


export const useProductVariants = (
  productId: string,
  params: VariantsParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: ["master-produk", "variants", productId, params],
    queryFn: () => ProductTabsService.variants(productId, params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })

export const useProductChannelListings = (
  productId: string,
  params: ChannelTabParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: ["master-produk", "channel-listings", productId, params],
    queryFn: () => ProductTabsService.channelListings(productId, params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })

export const useProductChannelPrices = (
  productId: string,
  params: ChannelTabParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: ["master-produk", "channel-prices", productId, params],
    queryFn: () => ProductTabsService.channelPrices(productId, params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })

export const useProductPriceBook = (
  productId: string,
  params: PriceBookParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: ["master-produk", "price-book", productId, params],
    queryFn: () => ProductTabsService.priceBook(productId, params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })

export const useProductUploadHistories = (
  productId: string,
  params: UploadHistoryParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: ["master-produk", "upload-histories", productId, params],
    queryFn: () => ProductTabsService.uploadHistories(productId, params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })

export const useReuploadHistory = (productId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ProductTabsService.reuploadHistory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["master-produk", "upload-histories", productId] })
    },
  })
}

export const useBulkVariants = (productId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { action: BulkVariantAction; variant_ids: string[] }) =>
      ProductTabsService.bulkVariants(productId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["master-produk", "variants", productId] })
    },
  })
}
