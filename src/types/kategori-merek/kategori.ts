export interface KategoriItem {
  id: number
  parent_id: number | null
  name: string
  is_active: boolean
  is_leaf: boolean
  source: "system" | "custom"
  is_enabled: boolean
  children?: KategoriItem[]
}

export interface ChannelInfo {
  code: string
  name: string
}

export interface KategoriMappingItem {
  category_id: number
  full_category_name: string
  source: "system" | "custom"
  channels: ChannelInfo[]
  [key: string]: unknown
}

export interface FlatKategori {
  id: number
  name: string
  fullPath: string
  isLeaf: boolean
  hasChildren: boolean
  source: "system" | "custom"
  isEnabled: boolean
}

export interface CategoryFormAttributes {
  specifications: CategoryAttributeItem[]
  variant_types: CategoryAttributeItem[]
}

export interface CategoryAttributeItem {
  attribute_id: number
  name: string
  options: { id: number; value: string }[]
  channels: Record<string, { mapped: boolean; required: boolean }>
}

export interface ChannelAttributeItem {
  id: string
  name: string
  external_id: string
  is_required: boolean
  is_multiple: boolean
  is_sale_prop: boolean
}
