import { fetchClient, fetchBlob } from "@/lib/api-client";
import type { ApiPaginated } from "@/types/api.types";

export type RackImportState =
  | "queued"
  | "previewing"
  | "previewed"
  | "confirming"
  | "done"
  | "done_with_errors"
  | "failed";

export type RackImportRowStatus =
  "place" | "manual_move" | "already" | "error" | "placed";

export interface RackImportBatch {
  id: string;
  batchNo: string;
  state: RackImportState;
  originalFilename: string;
  totalRows: number;
  placeRows: number;
  manualMoveRows: number;
  alreadyRows: number;
  errorRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  progressPercent: number;
  errorMessage: string | null;
  createdAt: string;
}

interface RawRackImportBatch {
  id: string;
  batch_no: string;
  state: RackImportState;
  original_filename: string;
  total_rows: number;
  place_rows: number;
  manual_move_rows: number;
  already_rows: number;
  error_rows: number;
  processed_rows: number;
  success_rows: number;
  failed_rows: number;
  progress_percent: number;
  error_message: string | null;
  created_at: string;
}

export interface RackImportRow {
  id: string;
  rowNo: number;
  sku: string | null;
  location: string | null;
  bin: string | null;
  productName: string | null;
  currentBin: string | null;
  status: RackImportRowStatus;
  message: string | null;
}

interface RawRackImportRow {
  id: string;
  row_no: number;
  sku: string | null;
  location: string | null;
  bin: string | null;
  product_name: string | null;
  current_bin: string | null;
  status: RackImportRowStatus;
  message: string | null;
}

type PageMeta = ApiPaginated<unknown>["meta"];

function mapBatch(raw: RawRackImportBatch): RackImportBatch {
  return {
    id: raw.id,
    batchNo: raw.batch_no,
    state: raw.state,
    originalFilename: raw.original_filename,
    totalRows: raw.total_rows,
    placeRows: raw.place_rows,
    manualMoveRows: raw.manual_move_rows,
    alreadyRows: raw.already_rows,
    errorRows: raw.error_rows,
    processedRows: raw.processed_rows,
    successRows: raw.success_rows,
    failedRows: raw.failed_rows,
    progressPercent: raw.progress_percent,
    errorMessage: raw.error_message,
    createdAt: raw.created_at,
  };
}

function mapRow(raw: RawRackImportRow): RackImportRow {
  return {
    id: raw.id,
    rowNo: raw.row_no,
    sku: raw.sku,
    location: raw.location,
    bin: raw.bin,
    productName: raw.product_name,
    currentBin: raw.current_bin,
    status: raw.status,
    message: raw.message,
  };
}

export const RackImportService = {
  downloadTemplate: (): Promise<void> =>
    fetchBlob(
      "/inventory/settings/import/template/rack-allocation",
      "Template_Alokasi_Rak.xlsx",
    ),

  downloadErrors: (batchId: string, batchNo?: string): Promise<void> =>
    fetchBlob(
      `/inventory/settings/rack-import/batches/${batchId}/errors/download`,
      `import-errors-${batchNo ?? batchId}.xlsx`,
    ),

  templateUrl: (): string =>
    `/api/app/inventory/settings/import/template/rack-allocation`,

  upload: async (file: File): Promise<RackImportBatch> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetchClient<{ data: RawRackImportBatch }>(
      `/inventory/settings/rack-import`,
      {
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return mapBatch(res.data);
  },

  listBatches: async (
    params: { state?: RackImportState; page?: number; perPage?: number } = {},
  ): Promise<{ items: RackImportBatch[]; meta: PageMeta }> => {
    const q = new URLSearchParams();
    if (params.state) q.set("state", params.state);
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 20));
    const res = await fetchClient<ApiPaginated<RawRackImportBatch>>(
      `/inventory/settings/rack-import/batches?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapBatch), meta: res.meta };
  },

  getBatch: async (id: string): Promise<RackImportBatch> => {
    const res = await fetchClient<{ data: RawRackImportBatch }>(
      `/inventory/settings/rack-import/batches/${id}`,
    );
    return mapBatch(res.data);
  },

  listRows: async (
    batchId: string,
    params: {
      status?: RackImportRowStatus;
      search?: string;
      page?: number;
      perPage?: number;
    } = {},
  ): Promise<{ items: RackImportRow[]; meta: PageMeta }> => {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.search) q.set("search", params.search);
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 20));
    const res = await fetchClient<ApiPaginated<RawRackImportRow>>(
      `/inventory/settings/rack-import/batches/${batchId}/rows?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapRow), meta: res.meta };
  },

  confirm: async (batchId: string): Promise<RackImportBatch> => {
    const res = await fetchClient<{ data: RawRackImportBatch }>(
      `/inventory/settings/rack-import/batches/${batchId}/confirm`,
      { method: "POST" },
    );
    return mapBatch(res.data);
  },

  errorsDownloadUrl: (batchId: string): string =>
    `/api/app/inventory/settings/rack-import/batches/${batchId}/errors/download`,
};
