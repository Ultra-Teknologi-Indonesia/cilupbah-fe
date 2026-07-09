"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  OrderImportService,
  type OrderImportBatchParams,
} from "@/services/pesanan/order-import.service";

export type {
  OrderImportBatch,
  OrderImportBatchError,
  OrderImportBatchState,
} from "@/services/pesanan/order-import.service";

export const orderImportTemplateUrl = () => OrderImportService.templateUrl();

export const orderImportErrorsDownloadUrl = (batchId: string) =>
  OrderImportService.errorsDownloadUrl(batchId);

export const orderImportBatchKey = (params: OrderImportBatchParams) =>
  ["pesanan", "import-batches", params] as const;

export const orderImportBatchErrorKey = (
  batchId: string,
  params: { page?: number; perPage?: number },
) => ["pesanan", "import-batch-errors", batchId, params] as const;

export function useOrderImportBatches(params: OrderImportBatchParams) {
  return useQuery({
    queryKey: orderImportBatchKey(params),
    queryFn: () => OrderImportService.listBatches(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some((b) => b.state === "queued" || b.state === "processing")
        ? 5000
        : false;
    },
  });
}

export function useOrderImportBatchErrors(
  batchId: string | null,
  params: { page?: number; perPage?: number },
) {
  return useQuery({
    queryKey: orderImportBatchErrorKey(batchId ?? "", params),
    queryFn: () => OrderImportService.listErrors(batchId as string, params),
    enabled: !!batchId,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useOrderImportFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => OrderImportService.importFile(file),
    onSuccess: (batch) => {
      toast.success("File diterima, import sedang diproses", {
        description: `Batch ${batch.batchNo} — ${batch.originalFilename}`,
      });
      qc.invalidateQueries({ queryKey: ["pesanan", "import-batches"] });
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message ||
          "Gagal mengupload file import",
      ),
  });
}
