import {
  BIN_QR_PAPER_DEFAULT,
  LocationService,
  type BinQrPaper,
} from "@/services/manajemen-rak/location.service"
import { OutboundService } from "@/services/proses-pesanan/outbound.service"

function extractApiMessage(err: unknown): string | null {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message
    if (typeof msg === "string" && msg) return msg
  }
  return null
}

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
  // `query` adalah read-only snapshot dari search params route preview (mis. ?bin_ids=…&paper=…).
  // Optional supaya entry lama tetap kompatibel tanpa perlu inspect query.
  fetchPdf: (
    id: string,
    query?: URLSearchParams,
    onProgress?: (msg: string) => void
  ) => Promise<DocumentFetchResult>
  // Function supaya bisa balik ke detail/edit page per-entity, bukan list statis.
  backUrl: (id: string) => string
  filename: (id: string, meta?: DocumentMeta) => string
  // Optional: dipanggil sebelum re-fetch ketika user klik "Coba lagi" dari error state.
  // Dipakai mis. untuk reset status label Shopee sebelum fetch ulang.
  resetBeforeRetry?: (id: string) => Promise<void>
}

export type DocumentTypeKey = "picklist" | "shipping-label" | "bin-qr"

export const DOCUMENT_TYPES: Record<DocumentTypeKey, DocumentTypeConfig> = {
  picklist: {
    title: "Dokumen Picklist",
    subtitle: (id, meta) => (meta?.picklist_no as string | undefined) ?? `PICK-${id.slice(0, 8)}…`,
    fetchPdf: async (id) => {
      const blob = await OutboundService.picklistPdf(id)
      return { blob }
    },
    backUrl: () => "/dashboard/proses-pesanan",
    filename: (id, meta) =>
      `${(meta?.picklist_no as string | undefined) ?? `PICK-${id}`}.pdf`,
  },

  "shipping-label": {
    title: "Label Pengiriman",
    subtitle: (id) => `Order ${id.slice(0, 8)}…`,
    fetchPdf: async (id) => {
      let res: Awaited<ReturnType<typeof OutboundService.marketplaceLabel>>
      try {
        res = await OutboundService.marketplaceLabel(id)
      } catch (err: unknown) {
        // Propagate the actual BE error message instead of swallowing it.
        const msg = extractApiMessage(err)
        throw new Error(msg ?? "Label tidak dapat dimuat dari marketplace.")
      }
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
    resetBeforeRetry: async (id) => {
      await OutboundService.retryMarketplaceLabel(id)
    },
    backUrl: () => "/dashboard/proses-pesanan",
    filename: (id) => `shipping-label-${id.slice(0, 8)}.pdf`,
  },

  // QR rak per-lokasi. `id` = locationId. Query optional:
  //   bin_ids=<csv>  → subset rak (kalau kosong, BE cetak semua bin lokasi).
  //   paper=<variant>→ ukuran kertas. Default thermal_50x40.
  "bin-qr": {
    title: "QR Rak",
    subtitle: (id, meta) => {
      const name = meta?.location_name as string | undefined
      const count = meta?.bin_count as number | undefined
      if (name) return count ? `${name} • ${count} rak` : name
      return `Lokasi ${id.slice(0, 8)}…`
    },
    fetchPdf: async (id, query, onProgress) => {
      const binIdsRaw = query?.get("bin_ids") ?? ""
      const binIds = binIdsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      const paperRaw = query?.get("paper")
      const paper: BinQrPaper = isBinQrPaper(paperRaw) ? paperRaw : BIN_QR_PAPER_DEFAULT

      const { job_id } = await LocationService.createBinQrJob(id, {
        binIds: binIds.length > 0 ? binIds : undefined,
        paper,
      })

      let blob: Blob | null = null
      while (true) {
        const statusData = await LocationService.getBinQrJobStatus(job_id)
        
        if (statusData.status === "failed") {
          throw new Error(statusData.error_message || "Job gagal diproses.")
        }
        
        if (statusData.status === "ready") {
          blob = await LocationService.downloadBinQrJobPdf(job_id)
          break
        }
        
        if (onProgress) {
          const p = statusData.progress
          onProgress(`Memproses... ${p.percent}% (${p.processed}/${p.total})`)
        }
        
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }

      return {
        blob,
        meta: {
          bin_count: binIds.length || undefined,
          paper,
        },
      }
    },
    backUrl: (id) => `/dashboard/lokasi/${id}/edit`,
    filename: (id, meta) => {
      const code = (meta?.location_code as string | undefined) ?? id.slice(0, 8)
      return `qr-rak-${code}.pdf`
    },
  },
}

function isBinQrPaper(value: string | null | undefined): value is BinQrPaper {
  return (
    value === "thermal_50x40" ||
    value === "thermal_80x40" ||
    value === "a4_single" ||
    value === "a4_multi"
  )
}

export function isDocumentType(value: string): value is DocumentTypeKey {
  return value in DOCUMENT_TYPES
}
