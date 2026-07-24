import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  BinMultiSkuPatternSuggestion,
  BinMultiSkuRule,
  BinMultiSkuRulePayload,
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

  suggestions: async (
    locationId: string,
  ): Promise<BinMultiSkuPatternSuggestion[]> => {
    const res = await fetchClient<
      ApiResponse<
        { pattern: string; matched_count: number; samples: string[] }[]
      >
    >(`/locations/${locationId}/multi-sku-rules/suggestions`);

    return (res.data ?? []).map((s) => ({
      pattern: s.pattern,
      matchedCount: s.matched_count,
      samples: s.samples ?? [],
    }));
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
