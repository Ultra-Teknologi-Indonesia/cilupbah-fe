"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { InboundService } from "@/services/barang-masuk/inbound.service";
import type { InboundListParams } from "@/types/barang-masuk/inbound";

const STALE = 30 * 1000;

export function useInbounds(params: InboundListParams = {}) {
  return useQuery({
    queryKey: ["inbound", "list", params],
    placeholderData: keepPreviousData,
    queryFn: () => InboundService.list(params),
    staleTime: STALE,
  });
}

export function useInboundDetail(id?: string) {
  return useQuery({
    queryKey: ["inbound", "detail", id],
    queryFn: () => InboundService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  });
}

export function useInboundItems(
  id?: string,
  params: {
    page: number;
    perPage: number;
    search?: string;
    sku?: string;
    sort?: string;
  } = { page: 1, perPage: 20 },
) {
  return useQuery({
    queryKey: ["inbound", "items", id, params],
    placeholderData: keepPreviousData,
    queryFn: () => InboundService.getItems(id!, params),
    enabled: !!id,
    staleTime: STALE,
  });
}

export function useCorrectReceivedLines(inboundId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { item_id: string; qty?: number }[]) =>
      InboundService.correctReceivedLines(inboundId, items),
    onSuccess: () => {
      toast.success("Penerimaan dikoreksi, stok dikembalikan dari bin inbound");
      qc.invalidateQueries({ queryKey: ["inbound", "detail", inboundId] });
      qc.invalidateQueries({ queryKey: ["inbound", "list"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message ||
          "Gagal mengoreksi penerimaan",
      ),
  });
}
