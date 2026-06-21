"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import {
  ImportService,
  type ImportBatchParams,
  type ImportBatchType,
} from "@/services/master-produk/import.service"

export const importBatchKey = (params: ImportBatchParams) =>
  ["master-produk", "import-batches", params] as const

export const importBatchErrorKey = (batchId: string, params: { page?: number; perPage?: number }) =>
  ["master-produk", "import-batch-errors", batchId, params] as const

export function useImportBatches(params: ImportBatchParams) {
  return useQuery({
    queryKey: importBatchKey(params),
    queryFn: () => ImportService.listBatches(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? []
      return items.some((b) => b.state === "queued" || b.state === "processing") ? 5000 : false
    },
  })
}

export function useImportBatchErrors(
  batchId: string | null,
  params: { page?: number; perPage?: number }
) {
  return useQuery({
    queryKey: importBatchErrorKey(batchId ?? "", params),
    queryFn: () => ImportService.listErrors(batchId as string, params),
    enabled: !!batchId,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useImportFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ type, file }: { type: ImportBatchType; file: File }) =>
      ImportService.importFile(type, file),
    onSuccess: (batch) => {
      toast.success("File diterima, import sedang diproses", {
        description: `Batch ${batch.batchNo} — ${batch.originalFilename}`,
      })
      qc.invalidateQueries({ queryKey: ["master-produk", "import-batches"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal mengupload file import"),
  })
}
