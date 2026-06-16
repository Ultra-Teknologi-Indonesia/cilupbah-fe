import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"

interface RawStockRow {
  item_id: string
  on_hand: number
  available: number
}

export interface VariantStock {
  onHand: number
  available: number
}

export const InventoryService = {
  
  getVariantStocks: async (
    itemIds: string[]
  ): Promise<Record<string, VariantStock>> => {
    if (itemIds.length === 0) return {}

    const res = await fetchClient<ApiResponse<RawStockRow[]>>(
      "/inventory/items/all-stocks",
      { method: "POST", data: { item_ids: itemIds } }
    )

    const acc: Record<string, VariantStock> = {}
    for (const row of res.data ?? []) {
      const cur = acc[row.item_id] ?? { onHand: 0, available: 0 }
      acc[row.item_id] = {
        onHand: cur.onHand + (row.on_hand ?? 0),
        available: cur.available + (row.available ?? 0),
      }
    }
    return acc
  },
}
