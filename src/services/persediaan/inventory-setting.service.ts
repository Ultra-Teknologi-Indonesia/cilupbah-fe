import { fetchBlob, fetchClient } from "@/lib/api-client";
import type { ApiPaginated, ApiResponse } from "@/types/api.types";
import type {
  ImportConfirmResult,
  ImportPreviewResult,
  ImportSettingType,
  InventorySettingProduct,
  RawInventorySettingProduct,
} from "@/types/persediaan/inventory-setting";

function mapProduct(raw: RawInventorySettingProduct): InventorySettingProduct {
  return {
    itemId: raw.item_id,
    sku: raw.sku,
    productName: raw.product_name ?? "",
    variationValues: raw.variation_values ?? [],
    thumbnail: raw.thumbnail,
    barcode: raw.barcode,
    minStock: raw.min_stock,
    safeStock: raw.safe_stock,
    purchaseLeadTime: raw.purchase_lead_time,
    isUnlimitedStock: raw.is_unlimited_stock,
  };
}

export interface InventorySettingListParams {
  search?: string;
  page?: number;
  perPage?: number;
}

type PageMeta = ApiPaginated<unknown>["meta"];

export const InventorySettingService = {
  listProducts: async (
    params: InventorySettingListParams = {},
  ): Promise<{ items: InventorySettingProduct[]; meta: PageMeta }> => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    q.set("page", String(params.page ?? 1));
    q.set("per_page", String(params.perPage ?? 20));

    const res = await fetchClient<ApiPaginated<RawInventorySettingProduct>>(
      `/inventory/settings/products?${q.toString()}`,
    );
    return { items: (res.data ?? []).map(mapProduct), meta: res.meta };
  },

  updateThresholds: async (
    itemId: string,
    payload: { min_stock?: number; safe_stock?: number },
  ): Promise<void> => {
    await fetchClient<ApiResponse<unknown>>(
      `/inventory/settings/products/${itemId}`,
      { method: "PATCH", data: payload },
    );
  },

  exportRackAllocation: async (params: {
    locationId?: string;
    search?: string;
  } = {}): Promise<void> => {
    const q = new URLSearchParams();
    if (params.locationId) q.set("location_id", params.locationId);
    if (params.search) q.set("search", params.search);
    const qs = q.toString();
    await fetchBlob(
      `/inventory/settings/export/rack-allocation${qs ? `?${qs}` : ""}`,
      `alokasi-rak-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  },

  downloadTemplate: (type: ImportSettingType): Promise<void> =>
    fetchBlob(
      `/inventory/settings/import/template/${type}`,
      `template-import-${type}.xlsx`,
    ),

  importTemplateUrl: (type: ImportSettingType): string =>
    `/api/app/inventory/settings/import/template/${type}`,

  importPreview: async (
    type: ImportSettingType,
    file: File,
  ): Promise<ImportPreviewResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetchClient<ApiResponse<ImportPreviewResult>>(
      `/inventory/settings/import/${type}/preview`,
      {
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  importConfirm: async (
    type: ImportSettingType,
    previewToken: string,
  ): Promise<ImportConfirmResult> => {
    const res = await fetchClient<ApiResponse<ImportConfirmResult>>(
      `/inventory/settings/import/${type}/confirm`,
      { method: "POST", data: { preview_token: previewToken } },
    );
    return res.data;
  },
};
