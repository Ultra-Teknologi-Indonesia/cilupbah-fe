"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  ImportService,
  type ImportBatchParams,
  type ImportBatchType,
} from "@/services/master-produk/import.service";
import { apiError } from "@/lib/toast";

export type {
  ImportBatch,
  ImportBatchError,
  ImportBatchRow,
  ImportBatchState,
  ImportBatchType,
  ImportRowStatus,
} from "@/services/master-produk/import.service";

export const importTemplateUrl = (type: ImportBatchType) =>
  ImportService.templateUrl(type);

export const importErrorsDownloadUrl = (batchId: string) =>
  ImportService.errorsDownloadUrl(batchId);

export const downloadImportTemplate = (type: ImportBatchType) =>
  ImportService.downloadTemplate(type);

export const downloadImportErrors = (batchId: string, batchNo?: string) =>
  ImportService.downloadErrors(batchId, batchNo);

export const importBatchKey = (params: ImportBatchParams) =>
  ["master-produk", "import-batches", params] as const;

export const importBatchSingleKey = (batchId: string) =>
  ["master-produk", "import-batch", batchId] as const;

export const importBatchRowsKey = (
  batchId: string,
  params: { page?: number; perPage?: number; status?: string; search?: string },
) => ["master-produk", "import-batch-rows", batchId, params] as const;

export const importBatchErrorKey = (
  batchId: string,
  params: { page?: number; perPage?: number },
) => ["master-produk", "import-batch-errors", batchId, params] as const;

export function useImportBatches(params: ImportBatchParams) {
  return useQuery({
    queryKey: importBatchKey(params),
    queryFn: () => ImportService.listBatches(params),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some((b) =>
        ["queued", "previewing", "confirming", "processing"].includes(b.state),
      )
        ? 3000
        : false;
    },
  });
}

export function useImportBatch(batchId: string | null) {
  return useQuery({
    queryKey: importBatchSingleKey(batchId ?? ""),
    queryFn: () => ImportService.getBatch(batchId as string),
    enabled: !!batchId,
    placeholderData: keepPreviousData,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state &&
        ["queued", "previewing", "confirming", "processing"].includes(state)
        ? 2000
        : false;
    },
  });
}

export function useImportBatchRows(
  batchId: string | null,
  params: { page?: number; perPage?: number; status?: string; search?: string } = {},
) {
  return useQuery({
    queryKey: importBatchRowsKey(batchId ?? "", params),
    queryFn: () => ImportService.listRows(batchId as string, params),
    enabled: !!batchId,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}

export function useImportBatchErrors(
  batchId: string | null,
  params: { page?: number; perPage?: number },
) {
  return useQuery({
    queryKey: importBatchErrorKey(batchId ?? "", params),
    queryFn: () => ImportService.listErrors(batchId as string, params),
    enabled: !!batchId,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useImportFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, file }: { type: ImportBatchType; file: File }) =>
      ImportService.importFile(type, file),
    onSuccess: (batch) => {
      toast.success("File diterima, memvalidasi pratinjau...", {
        description: `Batch ${batch.batchNo} — ${batch.originalFilename}`,
      });
      qc.invalidateQueries({ queryKey: ["master-produk", "import-batches"] });
    },
    onError: (err) =>
      apiError(err, "Gagal mengupload file import"),
  });
}

export function useConfirmImportBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => ImportService.confirmBatch(batchId),
    onSuccess: (batch) => {
      toast.success("Penerapan import dimulai di latar belakang", {
        description: `Batch ${batch.batchNo} sedang diproses.`,
      });
      qc.invalidateQueries({ queryKey: ["master-produk", "import-batches"] });
      qc.invalidateQueries({ queryKey: ["master-produk", "import-batch", batch.id] });
    },
    onError: (err) =>
      apiError(err, "Gagal memulai penerapan import"),
  });
}
