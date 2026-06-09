import { ApiResponse } from "../api.types";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthData {
  access_token: string;
  token_type: string;
  user: User;
}

export type LoginResponse = ApiResponse<AuthData>;
