import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"
import type {
  MonitorStockRow,
  MonitorAnalyticsRow,
  MonitorSyncFailedRow,
  MonitorListParams,
  MonitorAnalyticsParams,
  FailedSyncParams,
  MonitorSummary,
  OutOfStockMode,
} from "@/types/monitor-stok/monitor"

function toQuery(params: MonitorListParams, extra: Record<string, string> = {}): string {
  const sp = new URLSearchParams()
  if (params.search) sp.set("search", params.search)
  if (params.location_id) sp.set("location_id", params.location_id)
  if (params.category_id) sp.set("category_id", params.category_id)
  if (params.page) sp.set("page", String(params.page))
  if (params.per_page) sp.set("per_page", String(params.per_page))
  for (const [k, v] of Object.entries(extra)) sp.set(k, v)
  return sp.toString()
}

async function listFrom(path: string) {
  const res = await fetchClient<ApiPaginated<MonitorStockRow>>(path)
  return { items: res.data ?? [], meta: res.meta }
}

async function analyticsFrom(path: string) {
  const res = await fetchClient<ApiPaginated<MonitorAnalyticsRow>>(path)
  return { items: res.data ?? [], meta: res.meta }
}

function analyticsQuery(params: MonitorAnalyticsParams): string {
  const extra: Record<string, string> = {}
  if (params.days) extra.days = String(params.days)
  if (params.window) extra.window = String(params.window)
  if (params.threshold) extra.threshold = String(params.threshold)
  return toQuery(params, extra)
}

export const MonitorStockService = {
  outOfStock: (mode: OutOfStockMode, params: MonitorListParams = {}) =>
    listFrom(`/inventory/monitor/out-of-stock?${toQuery(params, { mode })}`),

  lowStock: (params: MonitorListParams = {}) =>
    listFrom(`/inventory/monitor/low-stock?${toQuery(params)}`),

  onOrder: (params: MonitorListParams = {}) =>
    listFrom(`/inventory/monitor/on-order?${toQuery(params)}`),

  summary: async (params: MonitorListParams = {}): Promise<MonitorSummary> => {
    const res = await fetchClient<ApiResponse<MonitorSummary>>(
      `/inventory/monitor/summary?${toQuery(params)}`
    )
    return res.data
  },

  deadStock: (params: MonitorAnalyticsParams = {}) =>
    analyticsFrom(`/inventory/monitor/dead-stock?${analyticsQuery(params)}`),

  fastMoving: (params: MonitorAnalyticsParams = {}) =>
    analyticsFrom(`/inventory/monitor/fast-moving?${analyticsQuery(params)}`),

  estimatedStockOut: (params: MonitorAnalyticsParams = {}) =>
    analyticsFrom(`/inventory/monitor/estimated-stock-out?${analyticsQuery(params)}`),

  failedSync: async (params: FailedSyncParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("search", params.search)
    if (params.channel_shop_id) sp.set("filter[channel_shop_id]", params.channel_shop_id)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    const res = await fetchClient<ApiPaginated<MonitorSyncFailedRow>>(
      `/inventory/monitor/failed-sync?${sp.toString()}`
    )
    return { items: res.data ?? [], meta: res.meta }
  },

  retrySync: async (id: string) => {
    const res = await fetchClient<ApiResponse<MonitorSyncFailedRow>>(
      `/inventory/monitor/failed-sync/${id}/retry`,
      { method: "POST", data: {} }
    )
    return res.data
  },

  retryBulkSync: async (ids: string[]) => {
    const res = await fetchClient<ApiResponse<{ retried: number }>>(
      `/inventory/monitor/failed-sync/retry-bulk`,
      { method: "POST", data: { ids } }
    )
    return res.data
  },
}
