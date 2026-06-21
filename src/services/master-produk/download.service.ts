import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"

/* ------------------------------------------------------------------ *
 * Progress — transaksi download massal (DownloadTransaction)
 * ------------------------------------------------------------------ */

export type DownloadState = "queued" | "downloading" | "done" | "failed"

export interface DownloadTransaction {
  trxId: string
  trxNo: string
  executedBy: string
  storeName: string | null
  storeId: string | null
  channelId: string | null
  channelCode: string | null
  channelName: string | null
  createdDate: string
  state: DownloadState
  isDownloaded: boolean
  onDownloadProcess: boolean
  totalDownloaded: number
  allProduct: number
  progressPercent: number
  errorMessage: string | null
}

interface RawDownloadTransaction {
  trx_id: string
  trx_no: string
  executed_by: string
  store_name: string | null
  store_id: string | null
  channel_id: string | null
  channel_code: string | null
  channel_name: string | null
  created_date: string
  state: DownloadState
  is_downloaded: boolean
  on_download_process: boolean
  total_downloaded: number
  all_product: number
  progress_percent: number
  error_message: string | null
}

export interface DownloadTransactionParams {
  shopId?: string
  state?: DownloadState
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}

function mapTransaction(raw: RawDownloadTransaction): DownloadTransaction {
  return {
    trxId: raw.trx_id,
    trxNo: raw.trx_no,
    executedBy: raw.executed_by,
    storeName: raw.store_name,
    storeId: raw.store_id,
    channelId: raw.channel_id,
    channelCode: raw.channel_code,
    channelName: raw.channel_name,
    createdDate: raw.created_date,
    state: raw.state,
    isDownloaded: raw.is_downloaded,
    onDownloadProcess: raw.on_download_process,
    totalDownloaded: raw.total_downloaded,
    allProduct: raw.all_product,
    progressPercent: raw.progress_percent,
    errorMessage: raw.error_message,
  }
}

/* ------------------------------------------------------------------ *
 * Detail transaksi — produk hasil download
 * ------------------------------------------------------------------ */

export interface DownloadTransactionItem {
  itemId: string
  itemName: string
  itemCode: string | null
  imgUrl: string | null
  channelGroupId: string | null
  status: string
  isMaster: boolean
  masterItemName: string | null
}

interface RawDownloadTransactionItem {
  item_id: string
  item_name: string
  item_code: string | null
  img_url: string | null
  channel_group_id: string | null
  status: string
  is_master: boolean
  master_item_name: string | null
}

export interface DownloadTransactionDetail {
  transaction: {
    trxNo: string
    progressPercent: number
    createdDate: string
    executedBy: string
    state: DownloadState
    storeName: string | null
  }
  products: DownloadTransactionItem[]
  count: number
  percent: number
  state: DownloadState
  meta: ApiPaginated<RawDownloadTransactionItem>["meta"]
}

interface RawDownloadTransactionDetail {
  transaction: {
    trx_no: string
    progress_percent: number
    created_date: string
    executed_by: string
    state: DownloadState
    store_name?: string | null
  }
  products: RawDownloadTransactionItem[]
  count: number
  percent: number
  state: DownloadState
}

export interface DownloadTransactionDetailParams {
  page?: number
  perPage?: number
  /** Filter "Status Produk": true = sudah master, false = belum. */
  isMaster?: boolean
  search?: string
}

/* ------------------------------------------------------------------ *
 * Download Satuan — pencarian produk di channel
 * ------------------------------------------------------------------ */

export interface ChannelSearchItem {
  externalProductId: string
  name: string
  sellerSku: string | null
  image: string | null
  shopId: string
  shopName: string | null
  channelCode: string
  alreadyDownloaded: boolean
}

interface RawChannelSearchItem {
  external_product_id: string
  name: string
  seller_sku: string | null
  image: string | null
  shop_id: string
  shop_name: string | null
  channel_code: string
  already_downloaded?: boolean
}

function mapSearchItem(raw: RawChannelSearchItem): ChannelSearchItem {
  return {
    externalProductId: raw.external_product_id,
    name: raw.name,
    sellerSku: raw.seller_sku,
    image: raw.image,
    shopId: raw.shop_id,
    shopName: raw.shop_name,
    channelCode: raw.channel_code,
    alreadyDownloaded: raw.already_downloaded ?? false,
  }
}

/* Kunci baris stabil untuk hasil pencarian (satu produk per toko). */
export const channelSearchRowId = (i: Pick<ChannelSearchItem, "shopId" | "externalProductId">) =>
  `${i.shopId}:${i.externalProductId}`

/* ------------------------------------------------------------------ */

export const DownloadService = {
  /** Daftar transaksi download massal (Progress). */
  listTransactions: async (
    params: DownloadTransactionParams = {}
  ): Promise<{ items: DownloadTransaction[]; meta: ApiPaginated<RawDownloadTransaction>["meta"] }> => {
    const q = new URLSearchParams()
    if (params.shopId) q.set("filter[shop_id]", params.shopId)
    if (params.state) q.set("filter[state]", params.state)
    if (params.dateFrom) q.set("filter[date_from]", params.dateFrom)
    if (params.dateTo) q.set("filter[date_to]", params.dateTo)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<ApiPaginated<RawDownloadTransaction>>(
      `/download-transactions?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapTransaction), meta: res.meta }
  },

  /** Detail satu transaksi + produk hasil download. */
  getTransaction: async (
    id: string,
    params: DownloadTransactionDetailParams = {}
  ): Promise<DownloadTransactionDetail> => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    if (params.isMaster != null) q.set("filter[is_master]", params.isMaster ? "1" : "0")
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<
      ApiResponse<RawDownloadTransactionDetail> & {
        meta: ApiPaginated<RawDownloadTransactionItem>["meta"]
      }
    >(`/download-transactions/${id}?${q.toString()}`)

    const d = res.data
    return {
      transaction: {
        trxNo: d.transaction.trx_no,
        progressPercent: d.transaction.progress_percent,
        createdDate: d.transaction.created_date,
        executedBy: d.transaction.executed_by,
        state: d.transaction.state,
        storeName: d.transaction.store_name ?? null,
      },
      products: (d.products ?? []).map((p) => ({
        itemId: p.item_id,
        itemName: p.item_name,
        itemCode: p.item_code,
        imgUrl: p.img_url,
        channelGroupId: p.channel_group_id,
        status: p.status,
        isMaster: p.is_master,
        masterItemName: p.master_item_name,
      })),
      count: d.count,
      percent: d.percent,
      state: d.state,
      meta: res.meta,
    }
  },

  /** Jadikan Master — promosikan produk status=download → master. */
  approveProduct: async (productId: string): Promise<void> => {
    await fetchClient(`/products/${productId}/approve`, { method: "POST" })
  },

  /** Download Massal — tarik semua produk satu toko. */
  downloadShop: async (channel: string, shopId: string): Promise<void> => {
    await fetchClient(`/${channel}/download`, {
      method: "POST",
      data: { shop_id: shopId },
    })
  },

  /** Download Massal — banyak toko dalam satu channel. */
  downloadShopBulk: async (channel: string, shopIds: string[]): Promise<void> => {
    await fetchClient(`/${channel}/download/bulk`, {
      method: "POST",
      data: { shop_ids: shopIds },
    })
  },

  /** Download Satuan — cari produk di channel (by SKU/nama). */
  searchChannel: async (params: {
    channel: string
    shopId: string
    q: string
  }): Promise<ChannelSearchItem[]> => {
    const search = new URLSearchParams()
    search.set("shop_id", params.shopId)
    if (params.q) search.set("q", params.q)
    const res = await fetchClient<ApiResponse<RawChannelSearchItem[]>>(
      `/${params.channel}/download/search?${search.toString()}`
    )
    return (res.data ?? []).map(mapSearchItem)
  },

  /** Download Satuan — tarik satu produk by external id. */
  downloadProduct: async (params: {
    channel: string
    shopId: string
    externalProductId: string
  }): Promise<void> => {
    await fetchClient(`/${params.channel}/download-product`, {
      method: "POST",
      data: { shop_id: params.shopId, external_product_id: params.externalProductId },
    })
  },
}
