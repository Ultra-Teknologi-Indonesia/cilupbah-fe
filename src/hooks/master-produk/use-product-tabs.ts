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
  type VariantsParams,
} from "@/services/master-produk/product-tabs.service"

/** Varian per-tab (lazy + server-paginated). enabled = tab Variasi aktif. */
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
