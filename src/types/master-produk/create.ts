export type ProductCreateStatus = "download" | "in_review"

export interface CreateMediaInput {
  media_uuid?: string
  url?: string
  media_type?: "image" | "video"
  is_primary?: boolean
  sort_order?: number
}

export interface VariantOptionInput {
  attribute_id: number
  value: string
}

export interface CreateVariantInput {
  sku: string
  barcode?: string | null
  sell_price: number
  buy_price?: number | null
  sales_tax_id?: number | null
  purchase_tax_id?: number | null
  min_stock?: number | null
  safe_stock?: number | null
  is_active?: boolean
  unlimited_shop_ids?: string[]
  options?: VariantOptionInput[]
}

export interface VariationTypeInput {
  attribute_id: number
  sort_order?: number
}

export interface SpecificationInput {
  attribute_id: number
  attribute_option_id?: number | null
  text_value?: string | null
}

export interface CreateProductPayload {
  name: string
  sku?: string | null
  category_id: number
  brand_id?: number | null
  description?: string | null
  is_bundle?: boolean
  is_consignment?: boolean
  order_type?: "REGULER" | "PREORDER" | "COD"
  indent_days?: number
  status?: ProductCreateStatus
  is_stored?: boolean
  is_sold?: boolean
  is_purchased?: boolean
  purchase_lead_time?: number | null
  sales_account_id?: string | null
  sales_return_account_id?: string | null
  inventory_account_id?: string | null
  cogs_account_id?: string | null
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  package_contents?: string | null
  media?: CreateMediaInput[]
  variation_types?: VariationTypeInput[]
  specifications?: SpecificationInput[]
  variants: CreateVariantInput[]
}

export interface CreateProductResult {
  productId: string
}


export type ProductUpdatePayload = Omit<
  CreateProductPayload,
  "status" | "variants"
> & {
  variants?: CreateVariantInput[]
}
