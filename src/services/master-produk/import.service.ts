import { fetchClient, fetchBlob } from "@/lib/api-client";
import type { ApiPaginated } from "@/types/api.types";

export type ImportBatchState =
  | "queued"
  | "previewing"
  | "previewed"
  | "confirming"
  | "processing"
  | "done"
  | "done_with_errors"
  | "failed";

export type ImportBatchType = "single" | "bundle";

export interface ImportBatch {
  id: string;
  batchNo: string;
  type: ImportBatchType;
  state: ImportBatchState;
  originalFilename: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  progressPercent: number;
  errorMessage: string | null;
  createdAt: string;
}

interface RawImportBatch {
  id: string;
  batch_no: string;
  type: ImportBatchType;
  state: ImportBatchState;
  original_filename: string;
  total_rows: number;
  processed_rows: number;
  success_rows: number;
  failed_rows: number;
  progress_percent: number;
  error_message: string | null;
  created_at: string;
}

export type ImportRowStatus = "valid" | "invalid" | "success" | "failed";

export interface ImportBatchRow {
  id: string;
  importBatchId: string;
  rowNumber: number;
  sku: string | null;
  name: string | null;
  categoryName: string | null;
  sellPrice: number | null;
  status: ImportRowStatus;
  message: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

interface RawImportBatchRow {
  id: string;
  import_batch_id: string;
  row_number: number;
  sku: string | null;
  name: string | null;
  category_name: string | null;
  sell_price: number | null;
  status: ImportRowStatus;
  message: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface ImportBatchError {
  rowNumber: number;
  attribute: string;
  message: string;
  rowSnapshot: Record<string, unknown> | null;
}

interface RawImportBatchError {
  row_number: number;
  attribute: string;
  message: string;
  row_snapshot: Record<string, unknown> | null;
}

export interface ImportBatchParams {
  type?: ImportBatchType;
  state?: ImportBatchState;
  page?: number;
  perPage?: number;
}

type PageMeta = ApiPaginated<unknown>["meta"];

function mapBatch(raw: RawImportBatch): ImportBatch {
  return {
    id: raw.id,
    batchNo: raw.batch_no,
    type: raw.type,
    state: raw.state,
    originalFilename: raw.original_filename,
    totalRows: raw.total_rows ?? 0,
    processedRows: raw.processed_rows ?? 0,
    successRows: raw.success_rows ?? 0,
    failedRows: raw.failed_rows ?? 0,
    progressPercent: raw.progress_percent ?? 0,
    errorMessage: raw.error_message,
    createdAt: raw.created_at,
  };
}

function mapRow(raw: RawImportBatchRow): ImportBatchRow {
  return {
    id: raw.id,
    importBatchId: raw.import_batch_id,
    rowNumber: raw.row_number,
    sku: raw.sku,
    name: raw.name,
    categoryName: raw.category_name,
    sellPrice: raw.sell_price,
    status: raw.status,
    message: raw.message,
    payload: raw.payload,
    createdAt: raw.created_at,
  };
}

function mapError(raw: RawImportBatchError): ImportBatchError {
  return {
    rowNumber: raw.row_number,
    attribute: raw.attribute,
    message: raw.message,
    rowSnapshot: raw.row_snapshot,
  };
}

export const ImportService = {
  listBatches: async (
    params: ImportBatchParams = {},
  ): Promise<{ items: ImportBatch[]; meta: PageMeta }> => {
    const q = new URLSearchParams();
    if (params.type) q.set("type", params.type);
    if (params.state) q.set("state", params.state);
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 25));

    const res = await fetchClient<ApiPaginated<RawImportBatch>>(
      `/products/import/batches?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapBatch), meta: res.meta };
  },

  getBatch: async (id: string): Promise<ImportBatch> => {
    const res = await fetchClient<{ data: RawImportBatch }>(
      `/products/import/batches/${id}`,
    );
    return mapBatch(res.data);
  },

  listRows: async (
    batchId: string,
    params: {
      page?: number;
      perPage?: number;
      status?: string;
      search?: string;
    } = {},
  ): Promise<{ items: ImportBatchRow[]; meta: PageMeta }> => {
    const q = new URLSearchParams();
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 25));
    if (params.status && params.status !== "all")
      q.set("status", params.status);
    if (params.search) q.set("search", params.search);

    const res = await fetchClient<ApiPaginated<RawImportBatchRow>>(
      `/products/import/batches/${batchId}/rows?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapRow), meta: res.meta };
  },

  listErrors: async (
    batchId: string,
    params: { page?: number; perPage?: number } = {},
  ): Promise<{ items: ImportBatchError[]; meta: PageMeta }> => {
    const q = new URLSearchParams();
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 50));

    const res = await fetchClient<ApiPaginated<RawImportBatchError>>(
      `/products/import/batches/${batchId}/errors?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapError), meta: res.meta };
  },

  importFile: async (
    type: ImportBatchType,
    file: File,
  ): Promise<ImportBatch> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetchClient<{ data: RawImportBatch }>(
      `/products/import/${type}`,
      {
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return mapBatch(res.data);
  },

  confirmBatch: async (batchId: string): Promise<ImportBatch> => {
    const res = await fetchClient<{ data: RawImportBatch }>(
      `/products/import/batches/${batchId}/confirm`,
      {
        method: "POST",
      },
    );
    return mapBatch(res.data);
  },

  downloadTemplate: (type: ImportBatchType): Promise<void> => {
    const filename =
      type === "single"
        ? "Template_Import_Product.xlsx"
        : "Template_Import_Bundle.xlsx";
    return fetchBlob(`/products/import/template/${type}`, filename);
  },

  downloadErrors: (batchId: string, batchNo?: string): Promise<void> => {
    const filename = `import-errors-${batchNo ?? batchId}.xlsx`;
    return fetchBlob(
      `/products/import/batches/${batchId}/errors/download`,
      filename,
    );
  },

  templateUrl: (type: ImportBatchType): string =>
    `/api/app/products/import/template/${type}`,

  errorsDownloadUrl: (batchId: string): string =>
    `/api/app/products/import/batches/${batchId}/errors/download`,
};
