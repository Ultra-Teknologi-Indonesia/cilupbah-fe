import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type { HppReportParams, HppReportPayload } from "@/types/laporan/hpp"

export const ReportService = {
  hpp: (params: HppReportParams) => {
    const sp = new URLSearchParams()
    sp.set("date_from", params.date_from)
    sp.set("date_to", params.date_to)
    if (params.location_id) sp.set("location_id", params.location_id)

    return fetchClient<ApiResponse<HppReportPayload>>(
      `/reports/hpp?${sp.toString()}`,
    )
  },
}
