import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated } from "@/types/api.types"
import type {
  FulfillmentListParams,
  Packlist,
  Picklist,
  RawPacklist,
  RawPicklist,
  RawShipment,
  Shipment,
} from "@/types/proses-pesanan/fulfillment"

// Proxy FE memetakan /api/app/* -> /api/v1/*, jadi endapoint outbound diakses
// lewat prefix "/outbound/...".

function qs(params: FulfillmentListParams): string {
  const q = new URLSearchParams()
  if (params.sub) q.set("sub", params.sub)
  if (params.q) q.set("q", params.q)
  if (params.location_id) q.set("location_id", params.location_id)
  if (params.courier) q.set("courier", params.courier)
  q.set("page", String(params.page ?? 1))
  q.set("per_page", String(params.per_page ?? 20))
  return q.toString()
}

function mapPicklist(raw: RawPicklist): Picklist {
  return {
    id: raw.id,
    picklistNo: raw.picklist_no,
    locationId: raw.location_id ?? null,
    locationName: raw.location_name ?? null,
    pickerId: raw.picker_id ?? null,
    pickerName: raw.picker_name ?? null,
    waveName: raw.wave_name ?? null,
    totalOrders: raw.total_orders ?? 0,
    totalQty: raw.total_qty ?? 0,
    durationMinutes: raw.duration_minutes ?? null,
    progressDone: raw.progress_done ?? 0,
    progressTotal: raw.progress_total ?? 0,
    status: raw.status ?? null,
  }
}

function mapPacklist(raw: RawPacklist): Packlist {
  return {
    id: raw.id,
    packlistNo: raw.packlist_no,
    locationId: raw.location_id ?? null,
    locationName: raw.location_name ?? null,
    packerId: raw.packer_id ?? null,
    packerName: raw.packer_name ?? null,
    totalOrders: raw.total_orders ?? 0,
    totalQty: raw.total_qty ?? 0,
    status: raw.status ?? null,
  }
}

function mapShipment(raw: RawShipment): Shipment {
  return {
    id: raw.id,
    shipmentNo: raw.shipment_no,
    courierCode: raw.courier_code ?? null,
    courierName: raw.courier_name ?? null,
    type: raw.type ?? null,
    totalOrders: raw.total_orders ?? 0,
    status: raw.status ?? null,
    scheduledAt: raw.scheduled_at ?? null,
  }
}

type Meta = ApiPaginated<unknown>["meta"]

export interface FulfillmentListResult<T> {
  items: T[]
  meta: Meta
}

const FALLBACK_META: Meta = { current_page: 1, last_page: 1, per_page: 20, total: 0 }

export const OutboundService = {
  picklists: async (
    params: FulfillmentListParams
  ): Promise<FulfillmentListResult<Picklist>> => {
    const res = await fetchClient<ApiPaginated<RawPicklist>>(
      `/outbound/picklists?${qs(params)}`
    )
    return { items: (res.data ?? []).map(mapPicklist), meta: res.meta ?? FALLBACK_META }
  },

  packlists: async (
    params: FulfillmentListParams
  ): Promise<FulfillmentListResult<Packlist>> => {
    const res = await fetchClient<ApiPaginated<RawPacklist>>(
      `/outbound/packlists?${qs(params)}`
    )
    return { items: (res.data ?? []).map(mapPacklist), meta: res.meta ?? FALLBACK_META }
  },

  shipments: async (
    params: FulfillmentListParams
  ): Promise<FulfillmentListResult<Shipment>> => {
    const res = await fetchClient<ApiPaginated<RawShipment>>(
      `/outbound/shipments?${qs(params)}`
    )
    return { items: (res.data ?? []).map(mapShipment), meta: res.meta ?? FALLBACK_META }
  },
}
