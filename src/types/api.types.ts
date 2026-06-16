export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data: T;
}


export type ApiList<T> = ApiResponse<T[]>;


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
