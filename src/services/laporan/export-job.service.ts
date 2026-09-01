import { fetchBlob, fetchBlobRaw, fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { ExportJobStatus } from "@/types/laporan/export-job";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 180; // maksimal sekitar 4,5 menit + latency API

export const ExportJobService = {
  status: async (id: string): Promise<ExportJobStatus> => {
    const res = await fetchClient<ApiResponse<ExportJobStatus>>(
      `/reports/exports/${id}`,
    );
    return res.data;
  },

  download: (
    id: string,
    filename: string,
    mimeType = XLSX_MIME,
  ): Promise<void> =>
    fetchBlob(`/reports/exports/${id}/download`, filename, mimeType),

  downloadBlob: (id: string, mimeType: string): Promise<Blob> =>
    fetchBlobRaw(`/reports/exports/${id}/download`, mimeType),

  waitForBlob: async (
    id: string,
    mimeType: string,
    onProgress?: (message: string) => void,
  ): Promise<{ blob: Blob; fileName: string | null }> => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      const job = await ExportJobService.status(id);

      if (job.status === "ready") {
        return {
          blob: await ExportJobService.downloadBlob(id, mimeType),
          fileName: job.file_name,
        };
      }

      if (job.status === "failed") {
        throw new Error(job.error ?? "Gagal membuat berkas export.");
      }

      onProgress?.(
        attempt === 0
          ? "Export sedang disiapkan di server…"
          : "Export masih diproses di server…",
      );
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    throw new Error("Pembuatan export terlalu lama. Silakan coba lagi.");
  },
};
