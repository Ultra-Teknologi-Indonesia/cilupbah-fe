import { fetchBlob, fetchClient } from "@/lib/api-client";
import type { ApiPaginated, ApiResponse } from "@/types/api.types";
import type {
  BinListParams,
  BinPreviewItem,
  GenerateBinsPayload,
  LocationBin,
  PendingPutawaySku,
  RawLocationBin,
  RawPendingPutawaySku,
  UniformApplyPayload,
} from "@/types/manajemen-rak/location";

function mapBin(raw: RawLocationBin): LocationBin & { id: string } {
  return {
    id: raw.id,
    floorCode: raw.floor_code,
    rowCode: raw.row_code,
    columnCode: raw.column_code,
    binCode: raw.bin_code,
    binFinalCode: raw.bin_final_code,
    isInbound: raw.is_inbound,
    isStockAcknowledged: raw.is_stock_acknowledged ?? true,
    isLargeBin: raw.is_large_bin ?? false,
    allowsMultiSku: raw.allows_multi_sku ?? false,
    skus: (raw.skus ?? []).map((s) => ({
      variantId: s.variant_id,
      sku: s.sku,
      name: s.name,
      onHand: s.on_hand,
      reserved: s.reserved,
    })),
  };
}

function mapPreviewItem(raw: {
  floor_code: string;
  row_code: string;
  column_code: string;
  bin_code: string;
  bin_final_code: string;
}): BinPreviewItem {
  return {
    floorCode: raw.floor_code,
    rowCode: raw.row_code,
    columnCode: raw.column_code,
    binCode: raw.bin_code,
    binFinalCode: raw.bin_final_code,
    isStockAcknowledged: true,
    isLargeBin: false,
  };
}

function buildBinQuery(params: BinListParams = {}): string {
  const q = new URLSearchParams();
  q.set("page", String(params.page ?? 1));
  q.set("per_page", String(params.perPage ?? 50));
  if (params.search) q.set("search", params.search);
  if (params.sort) q.set("sort", params.sort);
  if (params.filter) {
    for (const [key, val] of Object.entries(params.filter)) {
      if (val !== undefined && val !== null && val !== "") {
        q.set(`filter[${key}]`, String(val));
      }
    }
  }
  return q.toString();
}

export interface BinListResult {
  items: (LocationBin & { id: string })[];
  meta: ApiPaginated<RawLocationBin>["meta"];
}

export interface BinPreviewResult {
  items: BinPreviewItem[];
  meta: ApiPaginated<unknown>["meta"];
}

export const LocationBinService = {
  downloadImportTemplate: (locationId: string) =>
    fetchBlob(
      `/locations/${locationId}/bins/import/template`,
      "template-import-kode-rak.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ),

  generate: async (
    locationId: string,
    payload: GenerateBinsPayload,
  ): Promise<{ generatedCount: number }> => {
    const res = await fetchClient<ApiResponse<{ generated_count: number }>>(
      `/locations/${locationId}/bins/generate`,
      { method: "POST", data: payload },
    );
    return { generatedCount: res.data?.generated_count ?? 0 };
  },

  importPreview: (
    locationId: string,
    file: File,
  ): Promise<
    ApiResponse<{
      total: number;
      new: number;
      existing: number;
      sample_new: string[];
    }>
  > => {
    const form = new FormData();
    form.append("file", file);
    return fetchClient(`/locations/${locationId}/bins/import/preview`, {
      method: "POST",
      data: form,
      headers: { "Content-Type": undefined as unknown as string },
    });
  },

  import: (
    locationId: string,
    file: File,
  ): Promise<
    ApiResponse<{ created: number; existing: number; zones_created: number }>
  > => {
    const form = new FormData();
    form.append("file", file);
    return fetchClient(`/locations/${locationId}/bins/import`, {
      method: "POST",
      data: form,
      headers: { "Content-Type": undefined as unknown as string },
    });
  },

  preview: async (
    locationId: string,
    payload: GenerateBinsPayload,
    page = 1,
    perPage = 50,
  ): Promise<BinPreviewResult> => {
    const res = await fetchClient<
      ApiPaginated<{
        floor_code: string;
        row_code: string;
        column_code: string;
        bin_code: string;
        bin_final_code: string;
      }>
    >(`/locations/${locationId}/bins/preview`, {
      method: "POST",
      data: { ...payload, page, per_page: perPage },
    });
    return {
      items: (res.data ?? []).map(mapPreviewItem),
      meta: res.meta,
    };
  },

  list: async (
    locationId: string,
    params: BinListParams = {},
  ): Promise<BinListResult> => {
    const res = await fetchClient<ApiPaginated<RawLocationBin>>(
      `/locations/${locationId}/bins?${buildBinQuery(params)}`,
    );
    return { items: (res.data ?? []).map(mapBin), meta: res.meta };
  },

  uniformApply: async (
    locationId: string,
    payload: UniformApplyPayload,
  ): Promise<{ affected: number }> => {
    const qs =
      payload.scope === "all"
        ? `?${buildBinQuery({
            search: payload.search,
            filter: payload.filter,
            page: 1,
            perPage: 1,
          })}`
        : "";

    const res = await fetchClient<ApiResponse<{ affected: number }>>(
      `/locations/${locationId}/bins/uniform-apply${qs}`,
      {
        method: "POST",
        data: {
          scope: payload.scope,
          ids: payload.ids,
          values: payload.values,
        },
      },
    );
    return res.data;
  },

  listPendingPutawaySkus: async (
    locationId: string,
    search?: string,
  ): Promise<PendingPutawaySku[]> => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetchClient<ApiResponse<RawPendingPutawaySku[]>>(
      `/locations/${locationId}/pending-putaway-skus${qs}`,
    );
    return (res.data ?? []).map((s) => ({
      variantId: s.variant_id,
      sku: s.sku,
      name: s.name,
      pendingQty: s.pending_qty,
      thumbnail: s.thumbnail ?? null,
    }));
  },

  listEligibleSkus: async (
    locationId: string,
    binId: string,
    params?: { search?: string; page?: number; per_page?: number },
  ): Promise<ApiPaginated<RawPendingPutawaySku>> => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", params.page.toString());
    if (params?.per_page) q.set("per_page", params.per_page.toString());
    const qs = q.toString() ? `?${q.toString()}` : "";
    return fetchClient<ApiPaginated<RawPendingPutawaySku>>(
      `/locations/${locationId}/bins/${binId}/eligible-skus${qs}`,
    );
  },

  assignSku: async (
    locationId: string,
    binId: string,
    itemId: string,
  ): Promise<{ bin_id: string; item_id: string; placed_qty: number }> => {
    const res = await fetchClient<
      ApiResponse<{ bin_id: string; item_id: string; placed_qty: number }>
    >(`/locations/${locationId}/bins/${binId}/assign-sku`, {
      method: "POST",
      data: { item_id: itemId },
    });
    return res.data;
  },

  moveSku: async (
    locationId: string,
    sourceBinId: string,
    itemId: string,
    destinationBinId: string,
  ): Promise<{
    source_bin_id: string;
    destination_bin_id: string;
    item_id: string;
    moved_qty: number;
  }> => {
    const res = await fetchClient<
      ApiResponse<{
        source_bin_id: string;
        destination_bin_id: string;
        item_id: string;
        moved_qty: number;
      }>
    >(`/locations/${locationId}/bins/${sourceBinId}/move-sku`, {
      method: "POST",
      data: { item_id: itemId, destination_bin_id: destinationBinId },
    });
    return res.data;
  },

  removeSku: async (
    locationId: string,
    binId: string,
    itemId: string,
  ): Promise<{
    bin_id: string;
    item_id: string;
    removed_qty: number;
    adjustment_no: string | null;
  }> => {
    const res = await fetchClient<
      ApiResponse<{
        bin_id: string;
        item_id: string;
        removed_qty: number;
        adjustment_no: string | null;
      }>
    >(`/locations/${locationId}/bins/${binId}/remove-sku`, {
      method: "POST",
      data: { item_id: itemId },
    });
    return res.data;
  },
};
