export interface ApiResponse<T = any> {
  status: "success" | "error";
  message: string;
  data: T;
}

export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}
