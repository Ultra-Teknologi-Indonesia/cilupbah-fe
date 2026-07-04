export interface InternalStore {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  logo_url: string | null;
  logo_thumb: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InternalStoreListParams {
  page?: number;
  per_page?: number;
  search?: string;
  "filter[is_active]"?: 0 | 1 | boolean;
  sort?: string;
}

export interface InternalStoreFormData {
  name: string;
  is_active: boolean;
}
