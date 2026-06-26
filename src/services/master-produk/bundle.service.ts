import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"


export interface CreateBundlePayload {
  id?: string
  name: string
  sku?: string | null
  category_id: number
  components: { variant_id: string; qty: number }[]
}

export const BundleService = {
  store: (payload: CreateBundlePayload): Promise<ApiResponse<{ product_id: string }>> =>
    fetchClient("/inventory/items", { method: "POST", data: payload }),
}
