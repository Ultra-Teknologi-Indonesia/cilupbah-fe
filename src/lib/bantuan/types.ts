export type FaqCategory =
  | "umum"
  | "pesanan"
  | "picking-packing-shipping"
  | "produk"
  | "stok-gudang"
  | "integrasi-channel"
  | "retur"
  | "pembelian"
  | "laporan"
  | "pengaturan"
  | "troubleshooting";

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  tags?: string[];
  relatedManualSlug?: string;
}

export interface ManualEntry {
  slug: string;
  moduleGroup: string;
  title: string;
  description?: string;
  keywords?: string[];
  route?: string;
  loader: () => Promise<{ default: React.ComponentType }>;
}

export interface ApiDocIndex {
  generated_at: string;
  version: string;
  totals: { modules: number; endpoints: number; undocumented: number };
  modules: Array<{
    slug: string;
    name: string;
    description: string;
    endpoints_count: number;
    undocumented: number;
  }>;
}

export interface ApiDocEndpoint {
  id: string;
  module_slug: string;
  module_name: string;
  method: string;
  path: string;
  summary: string;
  description: string;
  purpose: string;
  controller: string | null;
  action: string | null;
  auth: string;
  roles: string[];
  rate_limit: string | null;
  deprecated: boolean;
  since_version: string | null;
  form_request: string | null;
  path_params: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  query_params: Array<{ name: string; type: string; description: string }>;
  body_schema: Record<
    string,
    {
      type: string;
      required: boolean;
      rules: string[];
      enum?: string[];
      exists?: string;
      constraints?: Record<string, unknown>;
      description?: string;
    }
  >;
  body_example: Record<string, unknown>;
  validation: string[];
  response_success_schema: Record<string, unknown>;
  response_success_example: Record<string, unknown>;
  response_resource?: string | null;
  response_errors: Array<{
    status: number;
    reason: string;
    body: Record<string, unknown>;
    terjemahan?: string;
  }>;
  status_codes: number[];
  side_effects: string[];
  allowed_filters?: Array<{
    name: string;
    type: string;
    column: string | null;
    scope: string | null;
    description?: string;
    usage_example?: string;
    enum?: string[];
  }>;
  allowed_sorts?: string[];
  allowed_search?: string[];
  allowed_includes?: string[];
  allowed_fields?: string[];
  default_sort?: string | null;
  related_endpoints:
    | Array<{
        id: string;
        method: string;
        path: string;
        summary: string;
      }>
    | string[];
  related_page: string | null;
  related_manual: string | null;
  needs_doc: boolean;
}

export interface ApiDocModule {
  slug: string;
  name: string;
  description: string;
  endpoints_count: number;
  undocumented: number;
  endpoints: ApiDocEndpoint[];
}
