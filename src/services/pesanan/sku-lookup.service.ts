import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";

export interface SkuLookupResult {
  item_id: string;
  sku: string;
  barcode: string | null;
  name: string | null;
  sell_price: number;
  weight_gram: number;
  on_hand: number;
  reserved: number;
  available: number;
}

export const SkuLookupService = {
  lookup: async (sku: string, locationId: string) => {
    const res = await fetchClient<ApiResponse<SkuLookupResult>>(
      `/sales/manual/lookup-sku`,
      {
        params: { sku, location_id: locationId },
      },
    );
    return res.data;
  },
};
