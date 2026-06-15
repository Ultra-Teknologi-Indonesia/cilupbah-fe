export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data: T;
}

/** Respons API yang membungkus daftar item. */
export type ApiList<T> = ApiResponse<T[]>;

/** Respons API berpaginasi (data + meta). */
export interface ApiPaginated<T> extends ApiResponse<T[]> {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}
