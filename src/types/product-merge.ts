export type MergeFilter = "all" | "merged" | "unmerged" | "hidden";

export interface MergeChannel {
  channel_shop_id: string;
  shop_name: string;
  channel_name: string | null;
  channel_code: string | null;
}

export interface MergeGroupProduct {
  id: string;
  name: string;
  sku: string | null;
  variant_skus: string[];
  merged: boolean;
}

export interface MergeGroup {
  name: string;
  norm_key: string;
  merged: boolean;
  hidden: boolean;
  foto: string | null;
  vendor: string;
  category: string;
  product_count: number;
  sku_count: number;
  products: MergeGroupProduct[];
  skus: string[];
  channels: MergeChannel[];
  channel_count: number;
}

export interface MergeCounts {
  all: number;
  merged: number;
  unmerged: number;
  hidden: number;
}

export interface MergeCatalogMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  counts: MergeCounts;
}

export interface MergeCatalogResult {
  rows: MergeGroup[];
  meta: MergeCatalogMeta;
}

export interface MergeSuggestionProduct {
  id: string;
  name: string;
  sku: string | null;
  vendor: string | null;
}

export interface MergeSuggestion {
  prefix: string;
  suggested_master_name: string;
  existing_master: boolean;
  unique_name_count: number;
  total: number;
  products: MergeSuggestionProduct[];
}

export interface AppliedMergeProduct {
  id: string;
  name: string;
  sku: string | null;
  variant_skus: string[];
  updated_at: string | null;
}

export interface AppliedMerge {
  master_name: string;
  product_count: number;
  products: AppliedMergeProduct[];
  channels: MergeChannel[];
  channel_count: number;
}

export interface MergeCatalogParams {
  filter?: MergeFilter;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface ApplyMergePayload {
  masterName: string;
  productIds: string[];
}

export interface ApplyMergeResult {
  merged: number;
  master_name: string;
}
