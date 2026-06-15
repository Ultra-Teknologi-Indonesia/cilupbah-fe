import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type { ChannelCode, RawConnectedStore } from "@/types/channel"

export interface StoreFlags {
  is_active?: boolean
  order_sync_enabled?: boolean
}

export const ChannelService = {
  listStores: async (): Promise<RawConnectedStore[]> => {
    const res = await fetchClient<ApiPaginated<RawConnectedStore>>(
      "/marketplace/store?per_page=200"
    )
    return res.data ?? []
  },

  getAuthUrl: async (channel: ChannelCode): Promise<string> => {
    const res = await fetchClient<ApiResponse<{ auth_url: string }>>(
      `/${channel}/auth`
    )
    return res.data.auth_url
  },

  setStoreFlags: async (
    id: string,
    flags: StoreFlags
  ): Promise<RawConnectedStore> => {
    const res = await fetchClient<ApiResponse<RawConnectedStore>>(
      `/marketplace/store/${id}`,
      { method: "PATCH", data: flags }
    )
    return res.data
  },

  disconnect: async (id: string): Promise<void> => {
    await fetchClient(`/marketplace/store/${id}`, { method: "DELETE" })
  },

  refreshToken: async (channel: ChannelCode, id: string): Promise<void> => {
    await fetchClient(`/${channel}/stores/${id}/refresh-token`, {
      method: "POST",
    })
  },
}
