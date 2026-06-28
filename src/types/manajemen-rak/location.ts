// Tipe untuk modul Pengaturan > Lokasi (manajemen gudang).

export interface RegionOption {
  id: string
  nama: string
  latitude?: number | null
  longitude?: number | null
}

export interface LocationVillage {
  id: string
  nama: string
  district?: {
    id: string
    nama: string
    city?: {
      id: string
      nama: string
      province?: { id: string; nama: string }
    }
  }
}

// Bentuk mentah dari API (LocationResource).
export interface RawLocation {
  id: string
  location_code: string
  location_name: string
  location_type: string | null
  address: string | null
  post_code: string | null
  village_id: string | null
  phone: string | null
  email: string | null
  coordinate: string | null
  default_warehouse_user: string | null
  is_warehouse: boolean
  is_multi_origin: boolean
  is_active: boolean
  is_system: boolean
  is_locked: boolean
  is_pos: boolean | null
  village?: LocationVillage | null
  bins?: RawLocationBin[]
  created_at?: string
  updated_at?: string
}

// Bentuk domain (camelCase) untuk dipakai di UI.
export interface Location {
  id: string
  locationCode: string
  locationName: string
  locationType: string | null
  address: string | null
  postCode: string | null
  villageId: string | null
  phone: string | null
  email: string | null
  coordinate: string | null
  defaultWarehouseUser: string | null
  isWarehouse: boolean
  isMultiOrigin: boolean
  isActive: boolean
  isSystem: boolean
  isLocked: boolean
  isPos: boolean
  village?: LocationVillage | null
  bins: LocationBin[]
  createdAt?: string
  updatedAt?: string
}

export interface RawLocationBin {
  id: string
  location_id: string
  zone_id: string | null
  floor_code: string | null
  row_code: string | null
  column_code: string | null
  bin_code: string | null
  bin_final_code: string
  max_qty: number
  is_inbound: boolean
  is_stock_acknowledged: boolean
  is_large_bin: boolean
  category: string | null
}

export interface LocationBin {
  id: string
  floorCode: string | null
  rowCode: string | null
  columnCode: string | null
  binCode: string | null
  binFinalCode: string
  maxQty: number
  isInbound: boolean
  isStockAcknowledged: boolean
  isLargeBin: boolean
  category: string | null
}

// Payload create/update yang dikirim ke API (snake_case sesuai request BE).
export interface LocationPayload {
  location_code: string
  location_name: string
  address?: string | null
  village_id?: string | null
  post_code?: string | null
  phone: string
  email: string
  coordinate?: string | null
  default_warehouse_user?: string | null
  is_warehouse?: boolean
  is_active?: boolean
  is_pos?: boolean
}

export interface WarehouseUser {
  id: string
  email: string
  isOwner: boolean
  lastLogin: string | null
}

export interface WarehouseLayoutSetting {
  useWarehouseLayout: boolean
}

// Layout Gudang: parameter generate bin (Lantai/Baris/Kolom/Rak).
export interface GenerateBinsPayload {
  floor_code: string
  qty_floor: number
  row_code: string
  qty_row: number
  column_code: string
  qty_column: number
  bin_code: string
  qty_bin: number
  max_qty?: number
}

// Parameter pagination + filter untuk listing bin (sesuai Spatie QueryBuilder).
export interface BinListParams {
  page?: number
  perPage?: number
  search?: string
  sort?: string  // contoh: "bin_final_code" atau "-max_qty"
  filter?: {
    is_inbound?: boolean
    is_stock_acknowledged?: boolean
    is_large_bin?: boolean
    category?: string
    zone_id?: string
  }
}

// Payload "Seragamkan": apply nilai ke baris terpilih atau seluruh data filter aktif.
export interface UniformApplyPayload {
  scope: "selected" | "all"
  ids?: string[]
  values: {
    max_qty?: number
    is_stock_acknowledged?: boolean
    is_large_bin?: boolean
    category?: string | null
  }
  // hanya dipakai ketika scope === "all" → diteruskan ke server sebagai query string
  filter?: BinListParams["filter"]
  search?: string
}

export interface BinPreviewItem {
  floorCode: string
  rowCode: string
  columnCode: string
  binCode: string
  binFinalCode: string
  maxQty: number
  isStockAcknowledged: boolean
  isLargeBin: boolean
  category: string
}

// Bin di tabel Layout Gudang. `id` = id bin di BE (ada bila bin sudah
// tersimpan); undefined untuk bin baru hasil generate yang belum disimpan.
export type BinDraft = BinPreviewItem & { id?: string }

export interface LocationListParams {
  search?: string
  page?: number
  perPage?: number
  sort?: string
}

export interface LocationZone {
  id: string
  location_id: string
  zone_code: string
  zone_name: string | null
  bins_count: number
  created_at: string
  updated_at: string
}

export interface LocationZoneFormData {
  zone_code: string
  zone_name?: string | null
  bin_ids?: string[]
}
