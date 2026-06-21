import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated } from "@/types/api.types"

export type ImportBatchState = "queued" | "processing" | "done" | "done_with_errors" | "failed"
export type ImportBatchType = "single" | "bundle"

export interface ImportBatch {
  id: string
  batchNo: string
  type: ImportBatchType
  state: ImportBatchState
  originalFilename: string
  totalRows: number
  processedRows: number
  successRows: number
  failedRows: number
  progressPercent: number
  errorMessage: string | null
  createdAt: string
}

interface RawImportBatch {
  id: string
  batch_no: string
  type: ImportBatchType
  state: ImportBatchState
  original_filename: string
  total_rows: number
  processed_rows: number
  success_rows: number
  failed_rows: number
  progress_percent: number
  error_message: string | null
  created_at: string
}

export interface ImportBatchError {
  rowNumber: number
  attribute: string
  message: string
  rowSnapshot: Record<string, unknown> | null
}

interface RawImportBatchError {
  row_number: number
  attribute: string
  message: string
  row_snapshot: Record<string, unknown> | null
}

export interface ImportBatchParams {
  type?: ImportBatchType
  state?: ImportBatchState
  page?: number
  perPage?: number
}

type PageMeta = ApiPaginated<unknown>["meta"]

function mapBatch(raw: RawImportBatch): ImportBatch {
  return {
    id: raw.id,
    batchNo: raw.batch_no,
    type: raw.type,
    state: raw.state,
    originalFilename: raw.original_filename,
    totalRows: raw.total_rows,
    processedRows: raw.processed_rows,
    successRows: raw.success_rows,
    failedRows: raw.failed_rows,
    progressPercent: raw.progress_percent,
    errorMessage: raw.error_message,
    createdAt: raw.created_at,
  }
}

function mapError(raw: RawImportBatchError): ImportBatchError {
  return {
    rowNumber: raw.row_number,
    attribute: raw.attribute,
    message: raw.message,
    rowSnapshot: raw.row_snapshot,
  }
}

export const ImportService = {
  listBatches: async (
    params: ImportBatchParams = {}
  ): Promise<{ items: ImportBatch[]; meta: PageMeta }> => {
    const q = new URLSearchParams()
    if (params.type) q.set("type", params.type)
    if (params.state) q.set("state", params.state)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 25))

    const res = await fetchClient<ApiPaginated<RawImportBatch>>(
      `/products/import/batches?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapBatch), meta: res.meta }
  },

  getBatch: async (id: string): Promise<ImportBatch> => {
    const res = await fetchClient<{ data: RawImportBatch }>(
      `/products/import/batches/${id}`
    )
    return mapBatch(res.data)
  },

  listErrors: async (
    batchId: string,
    params: { page?: number; perPage?: number } = {}
  ): Promise<{ items: ImportBatchError[]; meta: PageMeta }> => {
    const q = new URLSearchParams()
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 50))

    const res = await fetchClient<ApiPaginated<RawImportBatchError>>(
      `/products/import/batches/${batchId}/errors?${q.toString()}`
    )
    return { items: (res.data ?? []).map(mapError), meta: res.meta }
  },

  importFile: async (type: ImportBatchType, file: File): Promise<ImportBatch> => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetchClient<{ data: RawImportBatch }>(
      `/products/import/${type}`,
      {
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    return mapBatch(res.data)
  },

  templateUrl: (type: ImportBatchType): string =>
    `/api/app/products/import/template/${type}`,

  errorsDownloadUrl: (batchId: string): string =>
    `/api/app/products/import/batches/${batchId}/errors/download`,
}
