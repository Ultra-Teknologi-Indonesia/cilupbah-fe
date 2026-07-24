import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  BinMultiSkuRule,
  BinMultiSkuRulePayload,
  BinMultiSkuRulePreview,
  RawBinMultiSkuRule,
} from "@/types/manajemen-rak/location";

function mapRule(raw: RawBinMultiSkuRule): BinMultiSkuRule {
  return {
    id: raw.id,
    pattern: raw.pattern,
    note: raw.note ?? null,
    isActive: raw.is_active,
    matchedCount: raw.matched_count ?? 0,
  };
}

export const BinMultiSkuRuleService = {
  list: async (locationId: string): Promise<BinMultiSkuRule[]> => {
    const res = await fetchClient<ApiResponse<RawBinMultiSkuRule[]>>(
      `/locations/${locationId}/multi-sku-rules`,
    );
    return (res.data ?? []).map(mapRule);
  },

  preview: async (
    locationId: string,
    pattern: string,
  ): Promise<BinMultiSkuRulePreview> => {
    const res = await fetchClient<
      ApiResponse<{
        pattern: string;
        matched_count: number;
        samples: string[];
        total_bins: number;
      }>
    >(
      `/locations/${locationId}/multi-sku-rules/preview?pattern=${encodeURIComponent(pattern)}`,
    );
    return {
      pattern: res.data?.pattern ?? "",
      matchedCount: res.data?.matched_count ?? 0,
      samples: res.data?.samples ?? [],
      totalBins: res.data?.total_bins ?? 0,
    };
  },

  create: async (
    locationId: string,
    payload: BinMultiSkuRulePayload,
  ): Promise<BinMultiSkuRule> => {
    const res = await fetchClient<ApiResponse<RawBinMultiSkuRule>>(
      `/locations/${locationId}/multi-sku-rules`,
      { method: "POST", data: payload },
    );
    return mapRule(res.data);
  },

  update: async (
    locationId: string,
    ruleId: string,
    payload: BinMultiSkuRulePayload,
  ): Promise<BinMultiSkuRule> => {
    const res = await fetchClient<ApiResponse<RawBinMultiSkuRule>>(
      `/locations/${locationId}/multi-sku-rules/${ruleId}`,
      { method: "PUT", data: payload },
    );
    return mapRule(res.data);
  },

  remove: async (locationId: string, ruleId: string): Promise<void> => {
    await fetchClient<ApiResponse<null>>(
      `/locations/${locationId}/multi-sku-rules/${ruleId}`,
      { method: "DELETE" },
    );
  },
};
