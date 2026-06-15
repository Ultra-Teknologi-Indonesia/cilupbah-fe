import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type {
  CreateProductPayload,
  CreateProductResult,
} from "@/types/master-produk"

export const ProductCreateService = {
  create: async (
    payload: CreateProductPayload
  ): Promise<CreateProductResult> => {
    const res = await fetchClient<ApiResponse<{ product_id: string }>>(
      "/products",
      { method: "POST", data: payload }
    )
    return { productId: res.data.product_id }
  },
}
