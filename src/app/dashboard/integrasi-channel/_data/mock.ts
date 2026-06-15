import type { Channel, ChannelGroup } from "@/types/channel"

// Channel groups dengan toko (TikTok & Tokopedia digabung jadi grup "TikTok").
export const MOCK_CHANNEL_GROUPS: ChannelGroup[] = [
  {
    id: "grp-tiktok",
    code: "tiktok",
    name: "TikTok",
    connectable: true,
    stores: [
      {
        id: "tt-1",
        shopId: "7493012",
        shopName: "Cilupbah Official",
        channel: { code: "tiktok", name: "TikTok Shop" },
        isActive: true,
        ordersEnabled: true,
        integration: { status: "normal" },
        connectedAt: "2026-05-21T08:14:00.000Z",
      },
      {
        id: "tp-1",
        shopId: "TP-88120",
        shopName: "Cilupbah Case (Tokopedia)",
        channel: { code: "tokopedia", name: "Tokopedia" },
        isActive: false,
        ordersEnabled: false,
        integration: { status: "normal" },
        linkedStore: { code: "tiktok", name: "Cilupbah Case" },
        connectedAt: "2026-05-22T03:10:00.000Z",
      },
      {
        id: "tp-2",
        shopId: "TP-88121",
        shopName: "Cilupbah ID Mall (Tokopedia)",
        channel: { code: "tokopedia", name: "Tokopedia" },
        isActive: true,
        ordersEnabled: true,
        integration: { status: "normal" },
        linkedStore: { code: "tiktok", name: "Cilupbah ID Mall" },
        connectedAt: "2026-05-22T03:12:00.000Z",
      },
      {
        id: "tp-3",
        shopId: "TP-88122",
        shopName: "iCase Official Store (Tokopedia)",
        channel: { code: "tokopedia", name: "Tokopedia" },
        isActive: false,
        ordersEnabled: true,
        integration: { status: "error", note: "Perlu otorisasi ulang" },
        connectedAt: "2026-04-18T06:00:00.000Z",
      },
      {
        id: "tp-4",
        shopId: "TP-88123",
        shopName: "icasestoreofficial (Tokopedia)",
        channel: { code: "tokopedia", name: "Tokopedia" },
        isActive: true,
        ordersEnabled: true,
        integration: { status: "normal" },
        accessNote: "Izin akses belum dikonfirmasi",
        connectedAt: "2026-06-01T09:30:00.000Z",
      },
    ],
  },
  {
    id: "grp-shopee",
    code: "shopee",
    name: "Shopee",
    connectable: false,
    stores: [
      { id: "sp-1", shopId: "SP-1001", shopName: "Cilupbah Case Official Shop", channel: { code: "shopee", name: "Shopee" }, isActive: true, ordersEnabled: true, integration: { status: "normal" }, connectedAt: "2026-05-10T02:00:00.000Z" },
      { id: "sp-2", shopId: "SP-1002", shopName: "Cilupbah ID Mall", channel: { code: "shopee", name: "Shopee" }, isActive: true, ordersEnabled: true, integration: { status: "normal" }, connectedAt: "2026-05-10T02:02:00.000Z" },
      { id: "sp-3", shopId: "SP-1003", shopName: "Goribox Store", channel: { code: "shopee", name: "Shopee" }, isActive: true, ordersEnabled: true, integration: { status: "normal" }, connectedAt: "2026-05-11T04:00:00.000Z" },
      { id: "sp-4", shopId: "SP-1004", shopName: "iCase Store Official", channel: { code: "shopee", name: "Shopee" }, isActive: true, ordersEnabled: true, integration: { status: "normal" }, connectedAt: "2026-05-12T07:30:00.000Z" },
      { id: "sp-5", shopId: "SP-1005", shopName: "X-case id Official store", channel: { code: "shopee", name: "Shopee" }, isActive: true, ordersEnabled: true, integration: { status: "normal" }, connectedAt: "2026-05-13T08:45:00.000Z" },
    ],
  },
  {
    id: "grp-lazada",
    code: "lazada",
    name: "Lazada",
    connectable: true,
    stores: [
      { id: "lz-1", shopId: "LZD-88210", shopName: "Ultra Fit Store", channel: { code: "lazada", name: "Lazada" }, isActive: true, ordersEnabled: true, integration: { status: "normal" }, connectedAt: "2026-06-02T03:40:00.000Z" },
      { id: "lz-2", shopId: "LZD-88211", shopName: "Ultra Fit Reseller", channel: { code: "lazada", name: "Lazada" }, isActive: false, ordersEnabled: false, integration: { status: "normal" }, connectedAt: "2026-04-25T01:15:00.000Z" },
    ],
  },
]

// Channel yang belum punya toko → ditawarkan untuk dihubungkan.
export const MOCK_AVAILABLE_CHANNELS: Channel[] = [
  { id: "ch-blibli", code: "blibli", name: "Blibli", connectable: false },
]
