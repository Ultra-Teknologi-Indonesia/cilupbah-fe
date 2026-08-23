export interface RegionOption {
  id: string;
  nama: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface LocationVillage {
  id: string;
  nama: string;
  district?: {
    id: string;
    nama: string;
    city?: {
      id: string;
      nama: string;
      province?: { id: string; nama: string };
    };
  };
}

export interface RawLocation {
  id: string;
  location_code: string;
  location_name: string;
  location_type: string | null;
  address: string | null;
  post_code: string | null;
  village_id: string | null;
  phone: string | null;
  email: string | null;
  coordinate: string | null;
  default_warehouse_user: string | null;
  is_warehouse: boolean;
  is_multi_origin: boolean;
  is_active: boolean;
  is_system: boolean;
  is_locked: boolean;
  is_pos: boolean | null;
  is_small_warehouse?: boolean;
  enforces_strict_bin_sku?: boolean;
  village?: LocationVillage | null;
  bins?: RawLocationBin[];
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  id: string;
  locationCode: string;
  locationName: string;
  locationType: string | null;
  address: string | null;
  postCode: string | null;
  villageId: string | null;
  phone: string | null;
  email: string | null;
  coordinate: string | null;
  defaultWarehouseUser: string | null;
  isWarehouse: boolean;
  isMultiOrigin: boolean;
  isActive: boolean;
  isSystem: boolean;
  isLocked: boolean;
  isPos: boolean;
  isSmallWarehouse?: boolean;
  enforcesStrictBinSku?: boolean;
  village?: LocationVillage | null;
  bins: LocationBin[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RawBinSku {
  variant_id: string;
  sku: string;
  name: string;
  on_hand: number;
  reserved: number;
}

export interface BinSku {
  variantId: string;
  sku: string;
  name: string;
  onHand: number;
  reserved: number;
}

export interface RawLocationBin {
  id: string;
  location_id: string;
  zone_id: string | null;
  floor_code: string | null;
  row_code: string | null;
  column_code: string | null;
  bin_code: string | null;
  bin_final_code: string;
  is_inbound: boolean;
  is_stock_acknowledged: boolean;
  is_large_bin: boolean;
  allows_multi_sku?: boolean;
  skus?: RawBinSku[];
}

export interface LocationBin {
  id: string;
  floorCode: string | null;
  rowCode: string | null;
  columnCode: string | null;
  binCode: string | null;
  binFinalCode: string;
  isInbound: boolean;
  isStockAcknowledged: boolean;
  isLargeBin: boolean;
  allowsMultiSku: boolean;
  skus: BinSku[];
}

export interface RawBinMultiSkuRule {
  id: string;
  location_id: string;
  pattern: string;
  note: string | null;
  is_active: boolean;
  matched_count?: number;
}

export interface BinMultiSkuRule {
  id: string;
  pattern: string;
  note: string | null;
  isActive: boolean;
  matchedCount: number;
}

export interface BinMultiSkuRulePayload {
  pattern: string;
  note?: string | null;
  is_active?: boolean;
}

export interface BinMultiSkuPatternSuggestion {
  pattern: string;
  matchedCount: number;
  samples: string[];
}

export interface LocationPayload {
  location_code: string;
  location_name: string;
  address?: string | null;
  village_id?: string | null;
  post_code?: string | null;
  phone?: string | null;
  email?: string | null;
  coordinate?: string | null;
  default_warehouse_user?: string | null;
  is_warehouse?: boolean;
  is_small_warehouse?: boolean;
  is_active?: boolean;
  is_pos?: boolean;
}

export interface WarehouseUser {
  id: string;
  email: string;
  isOwner: boolean;
  lastLogin: string | null;
}

export interface WarehouseLayoutSetting {
  useWarehouseLayout: boolean;
}

export interface GenerateBinsPayload {
  zone_code: string;
  row_code: string;
  qty_row: number;
  column_code: string;
  qty_column: number;
  bin_code: string;
  qty_bin: number;
}

export interface BinListParams {
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  filter?: {
    is_inbound?: boolean;
    is_stock_acknowledged?: boolean;
    is_large_bin?: boolean;
    zone_id?: string;
  };
}

export interface UniformApplyPayload {
  scope: "selected" | "all";
  ids?: string[];
  values: {
    is_stock_acknowledged?: boolean;
    is_large_bin?: boolean;
    zone_id?: string | null;
  };

  filter?: BinListParams["filter"];
  search?: string;
}

export interface BinPreviewItem {
  floorCode: string;
  rowCode: string;
  columnCode: string;
  binCode: string;
  binFinalCode: string;
  isStockAcknowledged: boolean;
  isLargeBin: boolean;
}

export type BinDraft = BinPreviewItem & { id?: string };

export interface RawPendingPutawaySku {
  variant_id: string;
  sku: string;
  name: string;
  pending_qty: number;
  thumbnail: string | null;
}

export interface PendingPutawaySku {
  variantId: string;
  sku: string;
  name: string;
  pendingQty: number;
  thumbnail: string | null;
}

export interface LocationListParams {
  search?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  excludeTransit?: boolean;
}

export interface LocationZone {
  id: string;
  location_id: string;
  zone_code: string;
  zone_name: string | null;
  bins_count: number;
  created_at: string;
  updated_at: string;
}

export interface LocationZoneFormData {
  zone_code: string;
  zone_name?: string | null;
  bin_ids?: string[];
}
