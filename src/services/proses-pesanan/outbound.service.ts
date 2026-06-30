import { fetchBlobRaw, fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"
import type {
  Courier,
  FulfillmentListParams,
  FulfillmentOrder,
  Packlist,
  PacklistDetail,
  PacklistItem,
  Picker,
  Picklist,
  PicklistDetail,
  PicklistItem,
  RawCourier,
  RawFulfillmentOrder,
  RawPacklist,
  RawPacklistDetail,
  RawPacklistItem,
  RawPicker,
  RawPicklist,
  RawPicklistDetail,
  RawPicklistItem,
  RawReadyToShipResult,
  RawShipment,
  ReadyToShipResult,
  Shipment,
} from "@/types/proses-pesanan/fulfillment"

export interface CreateShipmentPayload {
  location_id: string
  courier_name?: string | null
  courier_code?: string | null
  shipment_type: string
  shipment_date: string
  notes?: string | null
}

// Proxy FE memetakan /api/app/* -> /api/v1/*. Endpoint outbound diakses lewat
// prefix "/outbound/...", endpoint dokumen lewat "/reports/...".

type Meta = ApiPaginated<unknown>["meta"]

export interface ListResult<T> {
  items: T[]
  meta: Meta
}

const FALLBACK_META: Meta = { current_page: 1, last_page: 1, per_page: 20, total: 0 }

function buildQuery(params: FulfillmentListParams, extra?: Record<string, string>): string {
  const q = new URLSearchParams()
  if (params.q) q.set("filter[q]", params.q)
  if (params.location_id) q.set("filter[location_id]", params.location_id)
  if (params.source) q.set("filter[source]", params.source)
  if (params.status) q.set("filter[status]", params.status)
  q.set("limit", String(params.per_page ?? 20))
  q.set("page", String(params.page ?? 1))
  if (extra) for (const [k, v] of Object.entries(extra)) q.set(k, v)
  return q.toString()
}

// ── Mappers ──────────────────────────────────────────────────────────────────
function mapOrder(raw: RawFulfillmentOrder): FulfillmentOrder {
  return {
    id: raw.id,
    salesorderNo: raw.salesorder_no,
    channelOrderNo: raw.channel_order_no ?? null,
    channelBuyerId: raw.channel_buyer_id ?? null,
    customerName: (raw.shipping_full_name && raw.shipping_full_name !== "****"
      ? raw.shipping_full_name
      : raw.customer_name) ?? null,
    source: raw.source ?? null,
    status: raw.status ?? null,
    isPaid: Boolean(raw.is_paid),
    transactionDate: raw.transaction_date ?? null,
    grandTotal: raw.grand_total ?? 0,
    actualShippingFee: raw.actual_shipping_fee ?? null,
    orderWeightGram: raw.order_weight_gram ?? null,
    locationId: raw.location_id ?? null,
    locationName: raw.location_name ?? raw.location?.location_name ?? null,
    trackingNumber: raw.tracking_number ?? null,
    shippingProvider: raw.shipping_provider ?? null,
    isCod: Boolean(raw.is_cod),
    priorityFulfillment: Boolean(raw.priority_fulfillment),
    isSplitOrder: Boolean(raw.is_split_order),
    cancelBy: raw.cancel_by ?? null,
    fulfillmentFlag: raw.fulfillment_flag ?? null,
    daysToShip: raw.days_to_ship ?? null,
    shipByDate: raw.ship_by_date ?? null,
    pickupDoneTime: raw.pickup_done_time ?? null,
    dropshipperName: raw.dropshipper_name ?? null,
    dropshipperPhone: raw.dropshipper_phone ?? null,
    totalQty: raw.total_qty ?? null,
    totalSku: raw.total_sku ?? null,
    items: (raw.items ?? []).map((i) => ({
      id: i.id,
      sku: i.sku,
      description: i.description,
      qty: i.qty_in_base,
      imageUrl: i.image_url ?? null,
    })),
  }
}

function mapPicklist(raw: RawPicklist): Picklist {
  const status = (raw.status ?? "DRAFT") as Picklist["status"]
  return {
    id: raw.id,
    picklistNo: raw.picklist_no,
    locationId: raw.location_id ?? raw.location?.id ?? null,
    locationName: raw.location?.location_name ?? null,
    pickerId: raw.picker_id ?? raw.picker?.id ?? null,
    pickerName: raw.picker?.name ?? null,
    status,
    startedAt: raw.started_at ?? null,
    completedAt: raw.completed_at ?? null,
    notes: raw.notes ?? null,
    itemsCount: raw.items_count ?? 0,
    qtyOrdered: raw.items_sum_qty_ordered ?? 0,
    qtyPicked: raw.items_sum_qty_picked ?? 0,
  }
}

function mapPacklist(raw: RawPacklist): Packlist {
  return {
    id: raw.id,
    packlistNo: raw.packlist_no,
    locationId: raw.location_id ?? raw.location?.id ?? null,
    locationName: raw.location?.location_name ?? null,
    packerId: raw.packer_id ?? raw.packer?.id ?? null,
    packerName: raw.packer?.name ?? null,
    orderNo: raw.order?.salesorder_no ?? null,
    customerName: raw.order?.customer_name ?? null,
    status: (raw.status ?? "DRAFT") as Packlist["status"],
    packageCount: raw.package_count ?? 1,
  }
}

function mapShipment(raw: RawShipment): Shipment {
  return {
    id: raw.id,
    shipmentNo: raw.shipment_no,
    locationId: raw.location_id ?? raw.location?.id ?? null,
    locationName: raw.location?.location_name ?? null,
    courierCode: raw.courier_code ?? null,
    courierName: raw.courier_name ?? null,
    shipmentType: raw.shipment_type ?? null,
    shipmentDate: raw.shipment_date ?? null,
    status: (raw.status ?? "SCHEDULED") as Shipment["status"],
    handedOverAt: raw.handed_over_at ?? null,
    ordersCount: raw.orders_count ?? 0,
  }
}

function mapCourier(raw: RawCourier): Courier {
  return {
    id: raw.id,
    name: raw.name ?? raw.code ?? raw.id,
    code: raw.code ?? null,
    type: raw.type ?? null,
    logoUrl: raw.logo_url ?? null,
    isActive: raw.is_active ?? true,
  }
}

function mapPicker(raw: RawPicker): Picker {
  return { id: raw.id, name: raw.name ?? raw.email ?? raw.id, email: raw.email ?? null }
}

function pickMediaUrl(media?: { url?: string | null; is_primary?: boolean | null; sort_order?: number | null }[] | null): string | null {
  if (!media || media.length === 0) return null
  const primary = media.find((m) => m?.is_primary)
  if (primary?.url) return primary.url
  // Fallback: ambil yang sort_order paling kecil (lalu first).
  const sorted = [...media].sort((a, b) => (a?.sort_order ?? 999) - (b?.sort_order ?? 999))
  return sorted[0]?.url ?? media[0]?.url ?? null
}

function mapPicklistItem(raw: RawPicklistItem): PicklistItem {
  // Prioritas image: accessor BE (image_url) > variant media > product media > legacy fields.
  const imageUrl =
    raw.image_url ??
    pickMediaUrl(raw.product?.media) ??
    pickMediaUrl(raw.product?.product?.media) ??
    raw.product?.image_url ??
    raw.product?.product?.image_url ??
    raw.orderItem?.image_url ??
    null

  return {
    id: raw.id,
    sku: raw.sku,
    name: raw.product?.product?.name ?? raw.orderItem?.description ?? null,
    variantName: raw.product?.variant_name ?? raw.orderItem?.variant_name ?? null,
    imageUrl,
    // Pure-scan: kode rak hanya ditampilkan setelah benar-benar di-pick (qty_picked > 0).
    // Sebelum scan, kolom rak per item harus kosong.
    binCode: (raw.qty_picked ?? 0) > 0
      ? (raw.bin?.bin_final_code ?? raw.bin?.bin_code ?? null)
      : null,
    orderNo: raw.order?.salesorder_no ?? null,
    trackingNumber: raw.order?.tracking_number ?? null,
    packageNo: raw.order?.package_no ?? raw.order?.shipment_no ?? null,
    itemStatus: raw.status ?? null,
    qtyOrdered: raw.qty_ordered ?? 0,
    qtyPicked: raw.qty_picked ?? 0,
  }
}

function mapPicklistDetail(raw: RawPicklistDetail): PicklistDetail {
  return { ...mapPicklist(raw), items: (raw.items ?? []).map(mapPicklistItem) }
}

function mapPacklistItem(raw: RawPacklistItem): PacklistItem {
  return {
    id: raw.id,
    sku: raw.sku,
    description: raw.orderItem?.description ?? null,
    qtyOrdered: raw.qty_ordered ?? 0,
    qtyPacked: raw.qty_packed ?? 0,
    barcodeVerified: Boolean(raw.barcode_verified),
  }
}

function mapPacklistDetail(raw: RawPacklistDetail): PacklistDetail {
  return { ...mapPacklist(raw), items: (raw.items ?? []).map(mapPacklistItem) }
}

function mapShipResult(raw: RawReadyToShipResult): ReadyToShipResult {
  return {
    orderId: raw.order_id,
    salesorderNo: raw.salesorder_no ?? null,
    source: raw.source ?? null,
    status: raw.status ?? "failed",
    message: raw.message ?? null,
  }
}

// Envelope paginator Laravel (dipakai /outbound/orders/{stage} dan /outbound/packlists).
interface RawPaginator<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

function paginatorMeta<T>(p: RawPaginator<T> | undefined, perPage?: number): Meta {
  return {
    current_page: p?.current_page ?? 1,
    last_page: p?.last_page ?? 1,
    per_page: p?.per_page ?? perPage ?? 20,
    total: p?.total ?? 0,
  }
}

export const OutboundService = {
  // Order per-stage (belum/selesai picking & packing). Envelope: {success, data: paginator}.
  ordersByStage: async (
    stage: string,
    params: FulfillmentListParams
  ): Promise<ListResult<FulfillmentOrder>> => {
    const res = await fetchClient<{ success?: boolean; data: RawPaginator<RawFulfillmentOrder> }>(
      `/outbound/orders/${stage}?${buildQuery(params)}`
    )
    return { items: (res.data?.data ?? []).map(mapOrder), meta: paginatorMeta(res.data, params.per_page) }
  },

  // Picklist. Envelope: {status, message, data[], meta}.
  picklists: async (params: FulfillmentListParams): Promise<ListResult<Picklist>> => {
    const res = await fetchClient<ApiPaginated<RawPicklist>>(
      `/outbound/picklists?${buildQuery(params)}`
    )
    return { items: (res.data ?? []).map(mapPicklist), meta: res.meta ?? FALLBACK_META }
  },

  // Packlist. Envelope: {success, data: paginator}.
  packlists: async (params: FulfillmentListParams): Promise<ListResult<Packlist>> => {
    const res = await fetchClient<{ success?: boolean; data: RawPaginator<RawPacklist> }>(
      `/outbound/packlists?${buildQuery(params)}`
    )
    return { items: (res.data?.data ?? []).map(mapPacklist), meta: paginatorMeta(res.data, params.per_page) }
  },

  // Shipment. Envelope: {success, data: paginator}.
  shipments: async (params: FulfillmentListParams): Promise<ListResult<Shipment>> => {
    const res = await fetchClient<{ success?: boolean; data: RawPaginator<RawShipment> }>(
      `/outbound/shipments?${buildQuery(params)}`
    )
    return { items: (res.data?.data ?? []).map(mapShipment), meta: paginatorMeta(res.data, params.per_page) }
  },

  // Courier aktif (untuk pilih kurir saat Buat Pengiriman). Envelope: {success, data: []}.
  couriersAll: async (): Promise<Courier[]> => {
    const res = await fetchClient<{ success?: boolean; data: RawCourier[] }>(`/outbound/couriers/all`)
    return (res.data ?? []).map(mapCourier)
  },

  // Daftar picker (warehouse user). Defensif terhadap envelope {status,data} / {success,data}.
  pickers: async (locationId?: string): Promise<Picker[]> => {
    const q = locationId ? `?location_id=${encodeURIComponent(locationId)}` : ""
    const res = await fetchClient<{ data: RawPicker[] }>(`/outbound/pickers${q}`)
    return (res.data ?? []).map(mapPicker)
  },

  // ── Mutasi ─────────────────────────────────────────────────────────────────
  createPicklist: async (payload: {
    order_ids: string[]
    location_id: string
    picker_id: string
    notes?: string | null
  }): Promise<Picklist> => {
    const res = await fetchClient<{ data: RawPicklist }>(`/outbound/picklists`, {
      method: "POST",
      data: payload,
    })
    return mapPicklist(res.data)
  },

  assignPicker: async (picklistId: string, pickerId: string): Promise<Picklist> => {
    const res = await fetchClient<{ data: RawPicklist }>(
      `/outbound/picklists/${picklistId}/assign-picker`,
      { method: "POST", data: { picker_id: pickerId } }
    )
    return mapPicklist(res.data)
  },

  // ── Picking scan/pick detail ─────────────────────────────────────────────
  picklistDetail: async (id: string): Promise<PicklistDetail> => {
    const res = await fetchClient<{ data: RawPicklistDetail }>(`/outbound/picklists/${id}`)
    return mapPicklistDetail(res.data)
  },
  startPicklist: async (id: string): Promise<void> => {
    await fetchClient(`/outbound/picklists/${id}/start`, { method: "POST" })
  },
  pickItem: async (
    picklistId: string,
    itemId: string,
    payload: { qty_picked: number; bin_id?: string | null }
  ): Promise<void> => {
    await fetchClient(`/outbound/picklists/${picklistId}/items/${itemId}/pick`, {
      method: "POST",
      data: payload,
    })
  },
  completePicklist: async (id: string): Promise<void> => {
    await fetchClient(`/outbound/picklists/${id}/complete`, { method: "POST" })
  },
  failPicklist: async (id: string, reason?: string): Promise<void> => {
    await fetchClient(`/outbound/picklists/${id}/fail`, {
      method: "POST",
      data: { reason: reason ?? null },
    })
  },

  // ── Ad-hoc pick (tanpa picklist) ─────────────────────────────────────────
  getOrderByNo: async (orderNo: string): Promise<RawFulfillmentOrder | null> => {
    try {
      const res = await fetchClient<{ data: RawFulfillmentOrder }>(`/outbound/orders/get-by-no`, {
        method: "POST",
        data: { order_no: orderNo },
      })
      return res.data ?? null
    } catch {
      return null
    }
  },
  adHocPick: async (payload: {
    order_id: string
    items?: Array<{ order_item_id: string; qty_picked: number; bin_id?: string | null }>
  }): Promise<unknown> => {
    const res = await fetchClient<{ data: unknown }>(`/outbound/orders/ad-hoc-pick`, {
      method: "POST",
      data: payload,
    })
    return res.data
  },
  adHocPickScan: async (payload: {
    order_id: string
    sku: string
    qty?: number
    bin_id?: string | null
  }): Promise<{
    completed: boolean
    matched_item_id: string
    qty_picked: number
    qty_ordered: number
    progress: Record<string, number>
    order: unknown
  }> => {
    const res = await fetchClient<{
      data: {
        completed: boolean
        matched_item_id: string
        qty_picked: number
        qty_ordered: number
        progress: Record<string, number>
        order: unknown
      }
    }>(`/outbound/orders/ad-hoc-pick/scan`, {
      method: "POST",
      data: payload,
    })
    return res.data
  },

  // ── Packing scan/pack detail ─────────────────────────────────────────────
  packlistDetail: async (id: string): Promise<PacklistDetail> => {
    const res = await fetchClient<{ data: RawPacklistDetail }>(`/outbound/packlists/${id}`)
    return mapPacklistDetail(res.data)
  },
  startPacklist: async (id: string): Promise<void> => {
    await fetchClient(`/outbound/packlists/${id}/start`, { method: "POST" })
  },
  verifyBarcode: async (
    packlistId: string,
    barcode: string
  ): Promise<{ itemId: string; sku: string } | null> => {
    const res = await fetchClient<{ data?: { item_id?: string; sku?: string } }>(
      `/outbound/packlists/${packlistId}/verify-barcode`,
      { method: "POST", data: { barcode } }
    )
    return res.data?.item_id ? { itemId: res.data.item_id, sku: res.data.sku ?? barcode } : null
  },
  packItem: async (
    packlistId: string,
    itemId: string,
    payload: { qty_packed: number; barcode_verified?: boolean }
  ): Promise<void> => {
    await fetchClient(`/outbound/packlists/${packlistId}/items/${itemId}/pack`, {
      method: "POST",
      data: payload,
    })
  },
  completePacklist: async (id: string): Promise<void> => {
    await fetchClient(`/outbound/packlists/${id}/complete`, { method: "POST" })
  },

  assignPacker: async (packlistId: string, packerId: string): Promise<Packlist> => {
    const res = await fetchClient<{ data: RawPacklist }>(
      `/outbound/packlists/${packlistId}/assign-packer`,
      { method: "POST", data: { packer_id: packerId } }
    )
    return mapPacklist(res.data)
  },

  // Buat Pengiriman: header dulu (SCHEDULED), lalu tautkan order (add-orders).
  createShipmentWithOrders: async (
    payload: CreateShipmentPayload,
    orderIds: string[]
  ): Promise<Shipment> => {
    const created = await fetchClient<{ data: RawShipment }>(`/outbound/shipments`, {
      method: "POST",
      data: payload,
    })
    const shipment = mapShipment(created.data)
    if (orderIds.length) {
      await fetchClient<{ data: RawShipment }>(`/outbound/shipments/${shipment.id}/add-orders`, {
        method: "POST",
        data: { order_ids: orderIds },
      })
    }
    return shipment
  },

  handOverShipment: async (shipmentId: string): Promise<Shipment> => {
    const res = await fetchClient<{ data: RawShipment }>(
      `/outbound/shipments/${shipmentId}/hand-over`,
      { method: "POST" }
    )
    return mapShipment(res.data)
  },

  cancelShipment: async (shipmentId: string): Promise<Shipment> => {
    const res = await fetchClient<{ data: RawShipment }>(
      `/outbound/shipments/${shipmentId}/cancel`,
      { method: "POST" }
    )
    return mapShipment(res.data)
  },

  // Manifest (envelope berbeda: {status, message, data: {report_type, generated_at, data}}).
  manifestDoc: async (shipmentId: string): Promise<unknown> => {
    const res = await fetchClient<ApiResponse<unknown>>(
      `/reports/wms/shipping-manifest?id=${encodeURIComponent(shipmentId)}`
    )
    return res.data
  },

  // Selesaikan Pesanan (modul Sales): finalisasi order packed/reserved -> shipped.
  markComplete: async (orderIds: string[]): Promise<number> => {
    const res = await fetchClient<{ data?: { completed?: number } }>(
      `/sales/orders/mark-as-complete`,
      { method: "POST", data: { order_ids: orderIds } }
    )
    return res.data?.completed ?? 0
  },

  // Omnichannel "Siap Dikirim" — dispatcher BE merutekan per source (Shopee/TikTok/Lazada).
  readyToShip: async (orderIds: string[]): Promise<ReadyToShipResult[]> => {
    const res = await fetchClient<{ data: RawReadyToShipResult[] }>(
      `/outbound/orders/ready-to-ship`,
      { method: "POST", data: { order_ids: orderIds } }
    )
    return (res.data ?? []).map(mapShipResult)
  },

  // ── Marketplace shipping label (AWB dari Shopee/TikTok/Lazada) ───────────────
  marketplaceLabel: async (
    orderId: string
  ): Promise<{ type: string; url?: string; document_base64?: string; content_type?: string; source?: string }> => {
    const res = await fetchClient<
      ApiResponse<{ type: string; url?: string; document_base64?: string; content_type?: string; source?: string }>
    >(`/sales/${orderId}/shipping-label`)
    return res.data
  },

  retryMarketplaceLabel: async (orderId: string): Promise<void> => {
    await fetchClient(`/sales/${orderId}/shipping-label/retry`, { method: "POST" })
  },

  // ── Dokumen (JSON dari modul Report) ─────────────────────────────────────────
  shippingLabel: async (orderIds: string[]): Promise<unknown> => {
    const res = await fetchClient<ApiResponse<unknown>>(
      `/reports/shipping-label?order_ids=${orderIds.join(",")}`
    )
    return res.data
  },

  pickListDoc: async (orderIds: string[]): Promise<unknown> => {
    const res = await fetchClient<ApiResponse<unknown>>(
      `/reports/wms/pick-list?order_ids=${orderIds.join(",")}`
    )
    return res.data
  },

  pickListByPicklist: async (picklistId: string): Promise<unknown> => {
    const res = await fetchClient<ApiResponse<unknown>>(
      `/reports/wms/pick-list?picklist_id=${encodeURIComponent(picklistId)}`
    )
    return res.data
  },

  // PDF Picklist (binary stream dari BE Outbound module). Caller mengatur filename
  // berdasarkan picklist_no yang sudah dimuat di FE.
  picklistPdf: async (picklistId: string): Promise<Blob> => {
    return fetchBlobRaw(
      `/outbound/picklists/${encodeURIComponent(picklistId)}/pdf`,
      "application/pdf"
    )
  },

  invoiceDoc: async (orderIds: string[]): Promise<unknown> => {
    const res = await fetchClient<ApiResponse<unknown>>(
      `/reports/invoice?order_ids=${orderIds.join(",")}`
    )
    return res.data
  },

  suratJalanDoc: async (orderIds: string[]): Promise<unknown> => {
    const res = await fetchClient<ApiResponse<unknown>>(
      `/reports/wms/shipping-manifest?order_ids=${orderIds.join(",")}`
    )
    return res.data
  },
}
