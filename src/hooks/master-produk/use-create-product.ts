"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { buildCreatePayload } from "@/lib/master-produk/build-create-payload";
import { MediaService } from "@/services/master-produk/media.service";
import { ProductCreateService } from "@/services/master-produk/product-create.service";
import type {
  BuatProdukFormValues,
  CreateMediaInput,
  ProductCreateStatus,
} from "@/types/master-produk";
import type { VariantMediaEntry } from "@/lib/master-produk/build-update-payload";

export interface CreateProductVars {
  values: BuatProdukFormValues;
  files: File[];
  status: ProductCreateStatus;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ values, files, status }: CreateProductVars) => {
      const uploaded = await Promise.all(
        files.map((f) => MediaService.upload(f)),
      );
      const media: CreateMediaInput[] = uploaded.map((m, i) => {
        const isVideo = files[i].type.startsWith("video/");
        return {
          media_uuid: m.uuid,
          media_type: isVideo ? "video" : "image",
          is_primary: i === 0,
          sort_order: i,
        };
      });

      const variantMedia: VariantMediaEntry[] = [];
      const variantsWithNewImage = values.variants.filter(
        (v) => v.imageFile instanceof File,
      );
      if (variantsWithNewImage.length > 0) {
        await Promise.all(
          variantsWithNewImage.map(async (v) => {
            const up = await MediaService.upload(v.imageFile as File);
            variantMedia.push({ variantKey: v.key, mediaUuid: up.uuid });
          }),
        );
      }

      const payload = buildCreatePayload(values, {
        status,
        media,
        variantMedia: variantMedia.length > 0 ? variantMedia : undefined,
      });
      return ProductCreateService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-produk"] });
    },
  });
}
