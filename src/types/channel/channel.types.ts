export type ChannelCode =
  | "tiktok"
  | "lazada"
  | "shopee"
  | "tokopedia"
  | "blibli"
  | (string & {})

export interface Channel {
  id: string
  code: ChannelCode
  name: string
  /** OAuth connect sudah didukung BE (TikTok & Lazada saat ini). */
  connectable: boolean
}

export interface ConnectedStore {
  id: string
  shopId: string
  shopName: string
  isActive: boolean
  channel: { id: string; code: ChannelCode; name: string }
  connectedAt: string
}

export interface RawChannel {
  id: string
  code: string
  name: string
}

export interface RawConnectedStore {
  id: string
  shop_id: string
  shop_name: string
  is_active: boolean
  channel: { id: string; code: string; name: string } | null
  created_at: string
}
