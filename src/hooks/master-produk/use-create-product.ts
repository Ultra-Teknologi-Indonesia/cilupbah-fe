"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { buildCreatePayload } from "@/lib/master-produk/build-create-payload"
import { MediaService } from "@/services/master-produk/media.service"
import { ProductCreateService } from "@/services/master-produk/product-create.service"
import type {
  BuatProdukFormValues,
  CreateMediaInput,
  ProductCreateStatus,
} from "@/types/master-produk"

export interface CreateProductVars {
  values: BuatProdukFormValues
  files: File[]
  status: ProductCreateStatus
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ values, files, status }: CreateProductVars) => {
      const uploaded = await Promise.all(files.map((f) => MediaService.upload(f)))
      const media: CreateMediaInput[] = uploaded.map((m, i) => ({
        media_uuid: m.uuid,
        media_type: "image",
        is_primary: i === 0,
        sort_order: i,
      }))

      const payload = buildCreatePayload(values, { status, media })
      return ProductCreateService.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-produk"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membuat produk"),
  })
}
