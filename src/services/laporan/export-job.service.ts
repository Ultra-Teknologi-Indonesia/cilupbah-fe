import { fetchBlob, fetchBlobRaw, fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { ExportJobStatus } from "@/types/laporan/export-job";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const ExportJobService = {
  status: async (id: string): Promise<ExportJobStatus> => {
    const res = await fetchClient<ApiResponse<ExportJobStatus>>(
      `/reports/exports/${id}`,
    );
    return res.data;
  },

  download: (id: string, filename: string): Promise<void> =>
    fetchBlob(`/reports/exports/${id}/download`, filename, XLSX_MIME),

  downloadBlob: (id: string, mimeType: string): Promise<Blob> =>
    fetchBlobRaw(`/reports/exports/${id}/download`, mimeType),
};
