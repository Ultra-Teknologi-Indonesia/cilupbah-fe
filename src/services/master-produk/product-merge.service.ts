import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  AppliedMerge,
  ApplyMergePayload,
  ApplyMergeResult,
  MergeCatalogMeta,
  MergeCatalogParams,
  MergeCatalogResult,
  MergeGroup,
  MergeSuggestion,
} from "@/types/product-merge";

interface CatalogResponse extends ApiResponse<MergeGroup[]> {
  meta: MergeCatalogMeta;
}

export const ProductMergeService = {
  catalog: async (
    params: MergeCatalogParams = {},
  ): Promise<MergeCatalogResult> => {
    const q = new URLSearchParams();
    if (params.filter) q.set("filter", params.filter);
    if (params.search) q.set("q", params.search);
    q.set("page", String(params.page ?? 1));
    q.set("limit", String(params.perPage ?? 50));

    const res = await fetchClient<CatalogResponse>(
      `/products/merge/catalog?${q.toString()}`,
    );
    return { rows: res.data ?? [], meta: res.meta };
  },

  suggestions: async (search = ""): Promise<MergeSuggestion[]> => {
    const q = new URLSearchParams();
    if (search) q.set("q", search);
    const res = await fetchClient<ApiResponse<MergeSuggestion[]>>(
      `/products/merge/suggestions?${q.toString()}`,
    );
    return res.data ?? [];
  },

  applied: async (search = ""): Promise<AppliedMerge[]> => {
    const q = new URLSearchParams();
    if (search) q.set("q", search);
    const res = await fetchClient<ApiResponse<AppliedMerge[]>>(
      `/products/merge/applied?${q.toString()}`,
    );
    return res.data ?? [];
  },

  apply: async ({
    masterName,
    productIds,
  }: ApplyMergePayload): Promise<ApplyMergeResult> => {
    const res = await fetchClient<ApiResponse<ApplyMergeResult>>(
      "/products/merge/apply",
      {
        method: "POST",
        data: { master_name: masterName, product_ids: productIds },
      },
    );
    return res.data;
  },

  bulk: async (
    masterName: string,
    productNames: string[],
  ): Promise<ApplyMergeResult> => {
    const res = await fetchClient<ApiResponse<ApplyMergeResult>>(
      "/products/merge/bulk",
      {
        method: "POST",
        data: { master_name: masterName, product_names: productNames },
      },
    );
    return res.data;
  },

  auto: async (): Promise<{ merged: number; groups_affected: number }> => {
    const res = await fetchClient<
      ApiResponse<{ merged: number; groups_affected: number }>
    >("/products/merge/auto", { method: "POST", data: {} });
    return res.data;
  },

  unmerge: async (productId: string): Promise<void> => {
    await fetchClient(`/products/merge/${productId}`, { method: "DELETE" });
  },

  unmergeMaster: async (masterName: string): Promise<void> => {
    await fetchClient("/products/merge/master", {
      method: "DELETE",
      data: { master_name: masterName },
    });
  },

  bulkUnmerge: async (masterNames: string[]): Promise<void> => {
    await fetchClient("/products/merge/bulk-unmerge", {
      method: "POST",
      data: { master_names: masterNames },
    });
  },

  hide: async (masterNames: string[]): Promise<void> => {
    await fetchClient("/products/merge/hide", {
      method: "POST",
      data: { master_names: masterNames },
    });
  },

  unhide: async (masterNames: string[]): Promise<void> => {
    await fetchClient("/products/merge/unhide", {
      method: "POST",
      data: { master_names: masterNames },
    });
  },
};
