"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiError } from "@/lib/toast";
import { BinMultiSkuRuleService } from "@/services/manajemen-rak/bin-multi-sku-rule.service";
import { locationBinKeys } from "@/hooks/manajemen-rak/use-location-bins";
import type { BinMultiSkuRulePayload } from "@/types/manajemen-rak/location";

export const multiSkuRuleKeys = {
  all: ["multi-sku-rules"] as const,
  list: (locationId: string) =>
    ["multi-sku-rules", "list", locationId] as const,
  preview: (locationId: string, pattern: string) =>
    ["multi-sku-rules", "preview", locationId, pattern] as const,
};

export function useMultiSkuRules(locationId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: multiSkuRuleKeys.list(locationId ?? ""),
    queryFn: () => BinMultiSkuRuleService.list(locationId!),
    enabled: enabled && !!locationId,
    staleTime: 30_000,
  });
}

export function useMultiSkuRulePreview(
  locationId: string | undefined,
  pattern: string,
  enabled = true,
) {
  const trimmed = pattern.trim();

  return useQuery({
    queryKey: multiSkuRuleKeys.preview(locationId ?? "", trimmed),
    queryFn: () => BinMultiSkuRuleService.preview(locationId!, trimmed),
    enabled: enabled && !!locationId && trimmed.length > 0,
    staleTime: 10_000,
  });
}

function useRuleMutation<TArgs>(
  locationId: string | undefined,
  fn: (locationId: string, args: TArgs) => Promise<unknown>,
  successMessage: string,
  errorMessage: string,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (args: TArgs) => {
      if (!locationId) throw new Error("locationId is required");
      return fn(locationId, args);
    },
    onSuccess: () => {
      toast.success(successMessage);
      qc.invalidateQueries({ queryKey: multiSkuRuleKeys.all });
      qc.invalidateQueries({ queryKey: locationBinKeys.all });
    },
    onError: (err) => apiError(err, errorMessage),
  });
}

export function useCreateMultiSkuRule(locationId?: string) {
  return useRuleMutation<BinMultiSkuRulePayload>(
    locationId,
    (id, payload) => BinMultiSkuRuleService.create(id, payload),
    "Berhasil menambah aturan rak multi-SKU",
    "Gagal menambah aturan",
  );
}

export function useUpdateMultiSkuRule(locationId?: string) {
  return useRuleMutation<{ ruleId: string; payload: BinMultiSkuRulePayload }>(
    locationId,
    (id, { ruleId, payload }) =>
      BinMultiSkuRuleService.update(id, ruleId, payload),
    "Berhasil memperbarui aturan rak multi-SKU",
    "Gagal memperbarui aturan",
  );
}

export function useDeleteMultiSkuRule(locationId?: string) {
  return useRuleMutation<string>(
    locationId,
    (id, ruleId) => BinMultiSkuRuleService.remove(id, ruleId),
    "Berhasil menghapus aturan rak multi-SKU",
    "Gagal menghapus aturan",
  );
}
