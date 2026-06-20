"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { buildUpdatePayload } from "@/lib/master-produk/build-update-payload"
import { MediaService } from "@/services/master-produk/media.service"
import { ProductUpdateService } from "@/services/master-produk/product-update.service"
import type { BuatProdukFormValues, CreateMediaInput } from "@/types/master-produk"
import type { EditMediaItem } from "@/components/dashboard/master-produk/buat/product-media-manager"
import { productDetailKey } from "./use-product-detail"

export interface UpdateProductVars {
  values: BuatProdukFormValues
  mediaItems: EditMediaItem[]
  includeVariant: boolean
  originalVariantSku?: string
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      values,
      mediaItems,
      includeVariant,
      originalVariantSku,
    }: UpdateProductVars) => {
      // Upload file baru lebih dulu untuk memperoleh uuid (S3 internal).
      const uploaded = new Map<string, string>()
      await Promise.all(
        mediaItems
          .filter((m) => m.kind === "new" && m.file)
          .map(async (m) => {
            const up = await MediaService.upload(m.file as File)
            uploaded.set(m.localId, up.uuid)
          })
      )

      // Kirim daftar media lengkap & terurut (existing + baru) sesuai editor.
      const media: CreateMediaInput[] = mediaItems.map((m, idx) => {
        const uuid = m.kind === "existing" ? m.uuid : uploaded.get(m.localId) ?? null
        return {
          media_uuid: uuid ?? undefined,
          // legacy: media existing tanpa uuid (URL marketplace lama) dipertahankan by url
          url: uuid ? undefined : m.url,
          media_type: m.mediaType,
          is_primary: m.isPrimary,
          sort_order: idx,
        }
      })

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
