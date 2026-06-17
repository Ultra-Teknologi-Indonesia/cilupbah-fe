import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type { WarehouseLayoutSetting } from "@/types/pengaturan/location"

type RawSetting = { use_warehouse_layout: boolean }

export const WarehouseSettingService = {
  get: async (): Promise<WarehouseLayoutSetting> => {
    const res = await fetchClient<ApiResponse<RawSetting>>(
      `/systemsetting/warehouse-layout`
    )
    return { useWarehouseLayout: Boolean(res.data?.use_warehouse_layout) }
  },

  save: async (useWarehouseLayout: boolean): Promise<WarehouseLayoutSetting> => {
    const res = await fetchClient<ApiResponse<RawSetting>>(
      `/systemsetting/warehouse-layout`,
      { method: "POST", data: { use_warehouse_layout: useWarehouseLayout } }
    )
    return { useWarehouseLayout: Boolean(res.data?.use_warehouse_layout) }
  },
}
