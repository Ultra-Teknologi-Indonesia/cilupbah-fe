import { OutboundService } from "@/services/proses-pesanan/outbound.service"

// Konversi base64 string → Blob (untuk dokumen yang dikembalikan BE sebagai base64,
// mis. shipping label dari marketplace).
function base64ToBlob(base64: string, contentType = "application/pdf"): Blob {
  const byteChars = atob(base64)
  const byteArray = new Uint8Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i)
  }
  return new Blob([byteArray], { type: contentType })
}

export interface DocumentMeta {
  // Optional: dipakai sebagai subtitle/filename hint setelah doc berhasil dimuat.
  // Reserved untuk extension future, mis. picklist_no, salesorder_no.
  [key: string]: unknown
}

export interface DocumentFetchResult {
  blob: Blob
  // Optional metadata yang BE kirim balik & berguna untuk filename / subtitle.
  meta?: DocumentMeta
}

export interface DocumentTypeConfig {
  title: string
  // Subtitle bisa pakai id mentah (sebelum dokumen ready) lalu update setelah meta tersedia.
  subtitle: (id: string, meta?: DocumentMeta) => string
  fetchPdf: (id: string) => Promise<DocumentFetchResult>
  backUrl: string
  filename: (id: string, meta?: DocumentMeta) => string
}

export type DocumentTypeKey = "picklist" | "shipping-label"

export const DOCUMENT_TYPES: Record<DocumentTypeKey, DocumentTypeConfig> = {
  picklist: {
    title: "Dokumen Picklist",
    subtitle: (id, meta) => (meta?.picklist_no as string | undefined) ?? `PICK-${id.slice(0, 8)}…`,
    fetchPdf: async (id) => {
      const blob = await OutboundService.picklistPdf(id)
      return { blob }
    },
    backUrl: "/dashboard/proses-pesanan",
    filename: (id, meta) =>
      `${(meta?.picklist_no as string | undefined) ?? `PICK-${id}`}.pdf`,
  },

  "shipping-label": {
    title: "Label Pengiriman",
    subtitle: (id) => `Order ${id.slice(0, 8)}…`,
    fetchPdf: async (id) => {
      const res = await OutboundService.marketplaceLabel(id)
      // BE bisa kembalikan `url` (langsung PDF dari marketplace) atau `document_base64`.
      if (res.type === "url" && res.url) {
        const r = await fetch(res.url, { credentials: "omit" })
        if (!r.ok) throw new Error("Gagal mengunduh label dari marketplace")
        const blob = await r.blob()
        return { blob, meta: { source: res.source } }
      }
      if (res.type === "base64" && res.document_base64) {
        const blob = base64ToBlob(res.document_base64, res.content_type ?? "application/pdf")
        return { blob, meta: { source: res.source } }
      }
      throw new Error("Format label tidak dikenali")
    },
    backUrl: "/dashboard/proses-pesanan",
    filename: (id) => `shipping-label-${id.slice(0, 8)}.pdf`,
  },
}

export function isDocumentType(value: string): value is DocumentTypeKey {
  return value in DOCUMENT_TYPES
}
