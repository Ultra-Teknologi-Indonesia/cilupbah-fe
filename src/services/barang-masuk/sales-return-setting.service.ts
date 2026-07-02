import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type { SalesReturnSetting, SalesReturnSettingPayload } from "@/types/barang-masuk/sales-return-setting"

const BASE = "/systemsetting/sales-return-setting"

export const SalesReturnSettingService = {
  get: async () => {
    const res = await fetchClient<ApiResponse<SalesReturnSetting>>(BASE)
    return res.data
  },
  save: async (data: SalesReturnSettingPayload) => {
    const res = await fetchClient<ApiResponse<SalesReturnSetting>>(BASE, {
      method: "POST",
      data,
    })
    return res.data
  },
}
