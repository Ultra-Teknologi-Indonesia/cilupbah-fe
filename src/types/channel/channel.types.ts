export type ChannelCode =
  | "tiktok"
  | "lazada"
  | "shopee"
  | "tokopedia"
  | "blibli"
  | (string & {})

export type IntegrationStatus = "normal" | "warning" | "error"

export interface StoreIntegration {
  status: IntegrationStatus
  
  note?: string
}

export interface ConnectedStore {
  id: string
  shopId: string
  shopName: string
  
  channel: { code: ChannelCode; name: string }
  isActive: boolean
  ordersEnabled: boolean
  integration: StoreIntegration
  
  accessNote?: string
  
  linkedStore?: { code: ChannelCode; name: string }
  connectedAt: string
}

export interface ChannelGroup {
  id: string
  code: ChannelCode
  name: string
  
  connectable: boolean
  stores: ConnectedStore[]
}

export interface Channel {
  id: string
  code: ChannelCode
  name: string
  connectable: boolean
}

export interface RawConnectedStore {
  id: string
  shop_id: string
  shop_name: string
  is_active: boolean
  order_sync_enabled: boolean
  integration: { status: IntegrationStatus; note?: string }
  token_expires_at: string | null
  channel: { id: string; code: string; name: string } | null
  created_at: string
}

export interface RawChannel {
  id: string
  code: string
  name: string
}
