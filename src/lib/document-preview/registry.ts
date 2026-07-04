import {
  BIN_QR_PAPER_DEFAULT,
  LocationService,
  type BinQrPaper,
} from "@/services/manajemen-rak/location.service";
import { OutboundService } from "@/services/proses-pesanan/outbound.service";
import { PutawayService } from "@/services/barang-masuk/putaway.service";
import { StockAdjustmentService } from "@/services/transaksi-stok/stock-adjustment.service";

function extractApiMessage(err: unknown): string | null {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string" && msg) return msg;
  }
  return null;
}

function base64ToBlob(base64: string, contentType = "application/pdf"): Blob {
  const byteChars = atob(base64);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  return new Blob([byteArray], { type: contentType });
}

export interface DocumentMeta {
  [key: string]: unknown;
}

export interface DocumentFetchResult {
  blob: Blob;

  meta?: DocumentMeta;
}

export interface DocumentTypeConfig {
  title: string;

  subtitle: (id: string, meta?: DocumentMeta) => string;

  fetchPdf: (
    id: string,
    query?: URLSearchParams,
    onProgress?: (msg: string) => void,
  ) => Promise<DocumentFetchResult>;

  backUrl: (id: string) => string;
  filename: (id: string, meta?: DocumentMeta) => string;

  resetBeforeRetry?: (id: string) => Promise<void>;
}

export type DocumentTypeKey =
  | "picklist"
  | "shipping-label"
  | "bin-qr"
  | "putaway"
  | "stock-adjustment"
  | "stock-adjustment-bulk";

export const DOCUMENT_TYPES: Record<DocumentTypeKey, DocumentTypeConfig> = {
  picklist: {
    title: "Dokumen Picklist",
    subtitle: (id, meta) =>
      (meta?.picklist_no as string | undefined) ?? `PICK-${id.slice(0, 8)}…`,
    fetchPdf: async (id) => {
      const blob = await OutboundService.picklistPdf(id);
      return { blob };
    },
    backUrl: () => "/dashboard/proses-pesanan",
    filename: (id, meta) =>
      `${(meta?.picklist_no as string | undefined) ?? `PICK-${id}`}.pdf`,
  },

  "shipping-label": {
    title: "Label Pengiriman",
    subtitle: (id) => `Order ${id.slice(0, 8)}…`,
    fetchPdf: async (id, query) => {
      const opts = {
        document_type: query?.get("document_type") ?? undefined,
        document_size: query?.get("document_size") ?? undefined,
      };
      let res: Awaited<ReturnType<typeof OutboundService.marketplaceLabel>>;
      try {
        res = await OutboundService.marketplaceLabel(id, opts);
      } catch (err: unknown) {
        const msg = extractApiMessage(err);
        throw new Error(msg ?? "Label tidak dapat dimuat dari marketplace.");
      }

      if (res.type === "url" && res.url) {
        const r = await fetch(
          `/api/proxy-download?url=${encodeURIComponent(res.url)}`,
        );
        if (!r.ok) throw new Error("Gagal mengunduh label dari marketplace");
        const blob = await r.blob();
        return { blob, meta: { source: res.source } };
      }
      if (res.type === "base64" && res.document_base64) {
        const blob = base64ToBlob(
          res.document_base64,
          res.content_type ?? "application/pdf",
        );
        return { blob, meta: { source: res.source } };
      }
      throw new Error("Format label tidak dikenali");
    },
    resetBeforeRetry: async (id) => {
      await OutboundService.retryMarketplaceLabel(id);
    },
    backUrl: () => "/dashboard/proses-pesanan",
    filename: (id) => `shipping-label-${id.slice(0, 8)}.pdf`,
  },

  "bin-qr": {
    title: "QR Rak",
    subtitle: (id, meta) => {
      const name = meta?.location_name as string | undefined;
      const count = meta?.bin_count as number | undefined;
      if (name) return count ? `${name} • ${count} rak` : name;
      return `Lokasi ${id.slice(0, 8)}…`;
    },
    fetchPdf: async (id, query, onProgress) => {
      const binIdsRaw = query?.get("bin_ids") ?? "";
      const binIds = binIdsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const paperRaw = query?.get("paper");
      const paper: BinQrPaper = isBinQrPaper(paperRaw)
        ? paperRaw
        : BIN_QR_PAPER_DEFAULT;

      const { job_id } = await LocationService.createBinQrJob(id, {
        binIds: binIds.length > 0 ? binIds : undefined,
        paper,
      });

      let blob: Blob | null = null;
      while (true) {
        const statusData = await LocationService.getBinQrJobStatus(job_id);

        if (statusData.status === "failed") {
          throw new Error(statusData.error_message || "Job gagal diproses.");
        }

        if (statusData.status === "ready") {
          blob = await LocationService.downloadBinQrJobPdf(job_id);
          break;
        }

        if (onProgress) {
          const p = statusData.progress;
          onProgress(`Memproses... ${p.percent}% (${p.processed}/${p.total})`);
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      return {
        blob,
        meta: {
          bin_count: binIds.length || undefined,
          paper,
        },
      };
    },
    backUrl: (id) => `/dashboard/lokasi/${id}/edit`,
    filename: (id, meta) => {
      const code =
        (meta?.location_code as string | undefined) ?? id.slice(0, 8);
      return `qr-rak-${code}.pdf`;
    },
  },

  putaway: {
    title: "Laporan Putaway",
    subtitle: (id, meta) =>
      (meta?.putaway_no as string | undefined) ?? `PUT-${id.slice(0, 8)}…`,
    fetchPdf: async (id) => {
      const blob = await PutawayService.pdf(id);
      return { blob };
    },
    backUrl: () => "/dashboard/barang-masuk/penempatan",
    filename: (id, meta) =>
      `${(meta?.putaway_no as string | undefined) ?? `PUTAWAY-${id}`}.pdf`,
  },

  "stock-adjustment": {
    title: "Laporan Penyesuaian",
    subtitle: (id, meta) =>
      (meta?.adjustment_no as string | undefined) ?? `ADJ-${id.slice(0, 8)}…`,
    fetchPdf: async (id) => {
      const blob = await StockAdjustmentService.pdf(id);
      return { blob };
    },
    backUrl: () => "/dashboard/transaksi-stok?tab=penyesuaian",
    filename: (id, meta) =>
      `Laporan-Penyesuaian-${
        (meta?.adjustment_no as string | undefined) ?? id
      }.pdf`,
  },

  "stock-adjustment-bulk": {
    title: "Laporan Penyesuaian (Bulk)",
    subtitle: (id) => {
      const count = id.split(",").filter(Boolean).length;
      return `${count} dokumen`;
    },
    fetchPdf: async (id) => {
      const ids = id.split(",").map((s) => s.trim()).filter(Boolean);
      const blob = await StockAdjustmentService.bulkPdf(ids);
      return { blob, meta: { count: ids.length } };
    },
    backUrl: () => "/dashboard/transaksi-stok?tab=penyesuaian",
    filename: () => {
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      return `Laporan-Penyesuaian-Bulk-${stamp}.pdf`;
    },
  },
};

function isBinQrPaper(value: string | null | undefined): value is BinQrPaper {
  return (
    value === "thermal_50x40" ||
    value === "thermal_80x40" ||
    value === "a4_single" ||
    value === "a4_multi"
  );
}

export function isDocumentType(value: string): value is DocumentTypeKey {
  return value in DOCUMENT_TYPES;
}
