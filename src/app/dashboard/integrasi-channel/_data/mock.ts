import type { Channel, ConnectedStore } from "@/types/channel"

// Data tiruan menyerupai GET /channels (connectable = punya OAuth di BE).
export const MOCK_CHANNELS: Channel[] = [
  { id: "ch-tiktok", code: "tiktok", name: "TikTok Shop", connectable: true },
  { id: "ch-lazada", code: "lazada", name: "Lazada", connectable: true },
  { id: "ch-shopee", code: "shopee", name: "Shopee", connectable: false },
  { id: "ch-tokopedia", code: "tokopedia", name: "Tokopedia", connectable: false },
  { id: "ch-blibli", code: "blibli", name: "Blibli", connectable: false },
]

// Data tiruan menyerupai GET /marketplace/store.
export const MOCK_CONNECTED_STORES: ConnectedStore[] = [
  {
    id: "store-1",
    shopId: "7493012",
    shopName: "Ultra Fit Official",
    isActive: true,
    channel: { id: "ch-tiktok", code: "tiktok", name: "TikTok Shop" },
    connectedAt: "2026-05-21T08:14:00.000Z",
  },
  {
    id: "store-2",
    shopId: "LZD-88210",
    shopName: "Ultra Fit Store",
    isActive: true,
    channel: { id: "ch-lazada", code: "lazada", name: "Lazada" },
    connectedAt: "2026-06-02T03:40:00.000Z",
  },
  {
    id: "store-3",
    shopId: "7491188",
    shopName: "Ultra Fit Reseller",
    isActive: false,
    channel: { id: "ch-tiktok", code: "tiktok", name: "TikTok Shop" },
    connectedAt: "2026-04-11T10:05:00.000Z",
  },
]
