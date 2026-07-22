export interface RawInventorySettingProduct {
  item_id: string;
  sku: string;
  product_name: string | null;
  variation_values: { label: string | null; value: string }[];
  thumbnail: string | null;
  barcode: string | null;
  min_stock: number;
  safe_stock: number;
  purchase_lead_time: number;
  is_unlimited_stock: boolean;
}

export interface InventorySettingProduct {
  itemId: string;
  sku: string;
  productName: string;
  variationValues: { label: string | null; value: string }[];
  thumbnail: string | null;
  barcode: string | null;
  minStock: number;
  safeStock: number;
  purchaseLeadTime: number;
  isUnlimitedStock: boolean;
}

export type ImportSettingType = "safe-stock" | "min-stock" | "rack-allocation";

export type ThresholdPreviewStatus = "update" | "error";

export interface ThresholdPreviewRow {
  row_no: number;
  sku: string;
  product_name: string | null;
  current: number | null;
  new: number | null;
  status: ThresholdPreviewStatus;
  message: string | null;
  item_id: string | null;
}

export type RackPreviewStatus = "place" | "manual_move" | "already" | "error";

export interface RackPreviewRow {
  row_no: number;
  sku: string;
  product_name?: string;
  location_name: string;
  bin_final_code: string;
  status: RackPreviewStatus;
  message: string;
  current_bin?: string;
}

export interface RackManualMove {
  sku: string;
  location_name: string;
  current_bin: string;
  target_bin: string;
}

export interface ImportPreviewResult {
  token: string;
  items: (ThresholdPreviewRow | RackPreviewRow)[];
  summary: Record<string, number>;
  manual_moves?: RackManualMove[];
}

export interface ImportConfirmResult {
  applied: number;
  skipped?: number;
  manual_moves?: number;
}
