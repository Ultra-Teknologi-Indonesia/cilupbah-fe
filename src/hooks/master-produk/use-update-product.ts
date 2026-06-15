"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { buildUpdatePayload } from "@/lib/master-produk/build-update-payload"
import { MediaService } from "@/services/master-produk/media.service"
import { ProductUpdateService } from "@/services/master-produk/product-update.service"
import type { BuatProdukFormValues, CreateMediaInput } from "@/types/master-produk"
import { productDetailKey } from "./use-product-detail"

export interface UpdateProductVars {
  values: BuatProdukFormValues
  files: File[]
  includeVariant: boolean
  originalVariantSku?: string
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      values,
      files,
      includeVariant,
      originalVariantSku,
    }: UpdateProductVars) => {
      let media: CreateMediaInput[] | undefined
      if (files.length) {
        const uploaded = await Promise.all(files.map((f) => MediaService.upload(f)))
        media = uploaded.map((m, i) => ({
          media_uuid: m.uuid,
          media_type: "image",
          is_primary: i === 0,
          sort_order: i,
        }))
      }

      const payload = buildUpdatePayload(values, {
        includeVariant,
        originalVariantSku,
        media,
      })
      return ProductUpdateService.update(id, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productDetailKey(id) })
      qc.invalidateQueries({ queryKey: ["master-produk", "list"] })
    },
  })
}
