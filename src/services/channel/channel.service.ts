import { fetchClient } from "@/lib/api-client";
import type { ApiResponse, ApiPaginated } from "@/types/api.types";
import type {
  ChannelCode,
  PrintLabelCapabilities,
  RawConnectedStore,
  RawStockAllocationStore,
  StockAllocationStore,
  StockSourceMode,
} from "@/types/channel";

export interface StoreFlags {
  is_active?: boolean;
  order_sync_enabled?: boolean;
  stock_source_mode?: StockSourceMode;
  location_id?: string | null;
}

function mapStockAllocationStore(
  raw: RawStockAllocationStore,
): StockAllocationStore {
  return {
    storeId: raw.store_id,
    channelName: raw.channel_name,
    storeName: raw.store_name,
    fullStoreName: raw.full_store_name,
    stockSourceMode: raw.stock_source_mode,
    locationId: raw.location_id,
    locationName: raw.location_name,
    locationCode: raw.location_code,
  };
}

export const ChannelService = {
  listStores: async (): Promise<RawConnectedStore[]> => {
    const res = await fetchClient<ApiPaginated<RawConnectedStore>>(
      "/marketplace/store?per_page=200",
    );
    return res.data ?? [];
  },

  getAuthUrl: async (channel: ChannelCode): Promise<string> => {
    const res = await fetchClient<ApiResponse<{ auth_url: string }>>(
      `/${channel}/auth`,
    );
    return res.data.auth_url;
  },

  setStoreFlags: async (
    id: string,
    flags: StoreFlags,
  ): Promise<RawConnectedStore> => {
    const res = await fetchClient<ApiResponse<RawConnectedStore>>(
      `/marketplace/store/${id}`,
      { method: "PATCH", data: flags },
    );
    return res.data;
  },

  listStockAllocation: async (): Promise<StockAllocationStore[]> => {
    const res = await fetchClient<ApiPaginated<RawStockAllocationStore>>(
      "/marketplace/stock-allocation?per_page=200",
    );
    return (res.data ?? []).map(mapStockAllocationStore);
  },

  disconnect: async (id: string): Promise<void> => {
    await fetchClient(`/marketplace/store/${id}`, { method: "DELETE" });
  },

  refreshToken: async (channel: ChannelCode, id: string): Promise<void> => {
    await fetchClient(`/${channel}/stores/${id}/refresh-token`, {
      method: "POST",
    });
  },

  getPrintLabelCapabilities: async (
    source: string,
  ): Promise<PrintLabelCapabilities> => {
    const res = await fetchClient<ApiResponse<PrintLabelCapabilities>>(
      `/channels/print-label-capabilities?source=${encodeURIComponent(source)}`,
    );
    return res.data;
  },
};
