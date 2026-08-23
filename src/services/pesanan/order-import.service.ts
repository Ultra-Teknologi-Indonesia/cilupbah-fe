import { fetchClient, fetchBlob } from "@/lib/api-client";
import type { ApiPaginated } from "@/types/api.types";

export type OrderImportBatchState =
  "queued" | "processing" | "done" | "done_with_errors" | "failed";

export interface OrderImportBatch {
  id: string;
  batchNo: string;
  state: OrderImportBatchState;
  originalFilename: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  progressPercent: number;
  errorMessage: string | null;
  createdAt: string;
}

interface RawOrderImportBatch {
  id: string;
  batch_no: string;
  state: OrderImportBatchState;
  original_filename: string;
  total_rows: number;
  processed_rows: number;
  success_rows: number;
  failed_rows: number;
  progress_percent: number;
  error_message: string | null;
  created_at: string;
}

export interface OrderImportBatchError {
  rowNumber: number;
  attribute: string;
  message: string;
  rowSnapshot: Record<string, unknown> | null;
}

interface RawOrderImportBatchError {
  row_number: number;
  attribute: string;
  message: string;
  row_snapshot: Record<string, unknown> | null;
}

export interface OrderImportBatchParams {
  state?: OrderImportBatchState;
  page?: number;
  perPage?: number;
}

type PageMeta = ApiPaginated<unknown>["meta"];

function mapBatch(raw: RawOrderImportBatch): OrderImportBatch {
  return {
    id: raw.id,
    batchNo: raw.batch_no,
    state: raw.state,
    originalFilename: raw.original_filename,
    totalRows: raw.total_rows,
    processedRows: raw.processed_rows,
    successRows: raw.success_rows,
    failedRows: raw.failed_rows,
    progressPercent: raw.progress_percent,
    errorMessage: raw.error_message,
    createdAt: raw.created_at,
  };
}

function mapError(raw: RawOrderImportBatchError): OrderImportBatchError {
  return {
    rowNumber: raw.row_number,
    attribute: raw.attribute,
    message: raw.message,
    rowSnapshot: raw.row_snapshot,
  };
}

export const OrderImportService = {
  listBatches: async (
    params: OrderImportBatchParams = {},
  ): Promise<{ items: OrderImportBatch[]; meta: PageMeta }> => {
    const q = new URLSearchParams();
    if (params.state) q.set("state", params.state);
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 25));

    const res = await fetchClient<ApiPaginated<RawOrderImportBatch>>(
      `/sales/orders/import/batches?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapBatch), meta: res.meta };
  },

  getBatch: async (id: string): Promise<OrderImportBatch> => {
    const res = await fetchClient<{ data: RawOrderImportBatch }>(
      `/sales/orders/import/batches/${id}`,
    );
    return mapBatch(res.data);
  },

  listErrors: async (
    batchId: string,
    params: { page?: number; perPage?: number } = {},
  ): Promise<{ items: OrderImportBatchError[]; meta: PageMeta }> => {
    const q = new URLSearchParams();
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 50));

    const res = await fetchClient<ApiPaginated<RawOrderImportBatchError>>(
      `/sales/orders/import/batches/${batchId}/errors?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapError), meta: res.meta };
  },

  importFile: async (file: File): Promise<OrderImportBatch> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetchClient<{ data: RawOrderImportBatch }>(
      "/sales/orders/import",
      {
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return mapBatch(res.data);
  },

  downloadTemplate: (): Promise<void> =>
    fetchBlob("/sales/orders/import/template", "Template_Import_Pesanan.xlsx"),

  downloadErrors: (batchId: string, batchNo?: string): Promise<void> =>
    fetchBlob(
      `/sales/orders/import/batches/${batchId}/errors/download`,
      `import-errors-${batchNo ?? batchId}.xlsx`,
    ),

  templateUrl: (): string => "/api/app/sales/orders/import/template",

  errorsDownloadUrl: (batchId: string): string =>
    `/api/app/sales/orders/import/batches/${batchId}/errors/download`,
};
