import { fetchClient } from "@/lib/api-client"
import type { ProductUpdatePayload } from "@/types/master-produk"

export const ProductUpdateService = {
  update: async (id: string, payload: ProductUpdatePayload): Promise<void> => {
    await fetchClient(`/products/${id}`, { method: "PUT", data: payload })
  },
}
