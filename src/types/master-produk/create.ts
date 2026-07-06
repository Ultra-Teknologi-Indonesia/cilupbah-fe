export type ProductCreateStatus = "master";

export interface CreateMediaInput {
  media_uuid?: string;
  url?: string;
  media_type?: "image" | "video";
  is_primary?: boolean;
  sort_order?: number;
}

export interface VariantOptionInput {
  attribute_id?: number;
  name?: string;
  value: string;
}

export interface CreateVariantInput {
  sku: string;
  sell_price: number;
  weight?: number | null;
  is_active?: boolean;
  options?: VariantOptionInput[];
  media?: CreateMediaInput[];
}

export interface VariationTypeInput {
  attribute_id?: number;
  name?: string;
  sort_order?: number;
}

export interface SpecificationInput {
  attribute_id: number;
  attribute_option_id?: number | null;
  text_value?: string | null;
}

export interface CreateProductPayload {
  name: string;
  sku?: string | null;
  category_id: number;
  description?: string | null;
  is_bundle?: boolean;
  status?: ProductCreateStatus;
  weight?: number | null;
  weight_unit?: "gram" | "kg";
  media?: CreateMediaInput[];
  variation_types?: VariationTypeInput[];
  specifications?: SpecificationInput[];
  variants: CreateVariantInput[];
}

export interface CreateProductResult {
  productId: string;
}

export type ProductUpdatePayload = Omit<
  CreateProductPayload,
  "status" | "variants"
> & {
  variants?: CreateVariantInput[];
};
