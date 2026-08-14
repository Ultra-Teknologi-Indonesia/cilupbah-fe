"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  RackImportService,
  type RackImportRowStatus,
  type RackImportState,
} from "@/services/persediaan/rack-import.service";
import { apiError } from "@/lib/toast";

export type {
  RackImportBatch,
  RackImportRow,
  RackImportRowStatus,
  RackImportState,
} from "@/services/persediaan/rack-import.service";

/** State di mana batch masih bergerak → perlu polling. */
const ACTIVE_STATES: RackImportState[] = ["queued", "previewing", "confirming"];

export const rackImportTemplateUrl = () => RackImportService.templateUrl();

export const rackImportErrorsDownloadUrl = (batchId: string) =>
  RackImportService.errorsDownloadUrl(batchId);

export const downloadRackImportTemplate = () =>
  RackImportService.downloadTemplate();

export const downloadRackImportErrors = (batchId: string, batchNo?: string) =>
  RackImportService.downloadErrors(batchId, batchNo);

export function useRackImportBatches(params: {
  state?: RackImportState;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ["persediaan", "rack-import-batches", params] as const,
    queryFn: () => RackImportService.listBatches(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some((b) => ACTIVE_STATES.includes(b.state)) ? 5000 : false;
    },
  });
}

export function useRackImportBatch(batchId: string | null) {
  return useQuery({
    queryKey: ["persediaan", "rack-import-batch", batchId ?? ""] as const,
    queryFn: () => RackImportService.getBatch(batchId as string),
    enabled: !!batchId,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state && ACTIVE_STATES.includes(state) ? 1500 : false;
    },
  });
}

export function useRackImportRows(
  batchId: string | null,
  params: {
    status?: RackImportRowStatus;
    search?: string;
    page?: number;
    perPage?: number;
  },
) {
  return useQuery({
    queryKey: ["persediaan", "rack-import-rows", batchId ?? "", params] as const,
    queryFn: () => RackImportService.listRows(batchId as string, params),
    enabled: !!batchId,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useUploadRackImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => RackImportService.upload(file),
    onSuccess: (batch) => {
      toast.success("File diterima, pratinjau sedang diproses", {
        description: `Batch ${batch.batchNo} — ${batch.originalFilename}`,
      });
      qc.invalidateQueries({ queryKey: ["persediaan", "rack-import-batches"] });
    },
    onError: (err) => apiError(err, "Gagal mengunggah file"),
  });
}

export function useConfirmRackImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => RackImportService.confirm(batchId),
    onSuccess: (batch) => {
      toast.success("Penerapan dimulai", {
        description: `${batch.placeRows} SKU sedang ditempatkan ke rak.`,
      });
      qc.invalidateQueries({ queryKey: ["persediaan", "rack-import-batch", batch.id] });
      qc.invalidateQueries({ queryKey: ["persediaan", "rack-import-batches"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err) => apiError(err, "Gagal menerapkan alokasi rak"),
  });
}
