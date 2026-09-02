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
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  user: User;
}

export type LoginResponse = ApiResponse<AuthData>;

export type LoginServerError = {
  status?: number;
  title?: string | null;
  message?: string | null;
  errors?: Record<string, string[] | string> | null;
};

export type LoginServerResult =
  | { ok: true; user: { name: string | null } }
  | { ok: false; error: LoginServerError };

export interface UpdateProfilePayload {
  name: string;
  nik?: string | null;
  phone?: string | null;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UserSession {
  id: string;
  name: string | null;
  last_used_at: string | null;
  created_at: string | null;
  expires_at: string | null;
  is_current: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  user_id: string | null;
  user_id_snapshot?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  agent_device: string | null;
  agent_os: string | null;
  agent_browser: string | null;
  ip_address: string | null;
  location_country: string | null;
  location_region: string | null;
  location_city: string | null;
  location_district: string | null;
  location_village: string | null;
  location_lat: number | null;
  location_lon: number | null;
  created_at: string;
}

export interface UserHistoryEntry {
  id: string;
  actor: { id: string; name: string; email: string } | null;
  target_user_id: string | null;
  target_user_id_snapshot?: string | null;
  target_user_name?: string | null;
  target_user_email?: string | null;
  action: string;
  message: string;
  created_at: string;
}

export interface MyProfileLocation {
  location_id: string;
  location_name: string;
}

export interface MyProfile {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  direct_permissions: string[];
  nik: string | null;
  phone: string | null;
  warehouse_id: string | null;
  locations: MyProfileLocation[];
  avatar_media_id: string | null;
  avatar_url: string | null;
  last_login_at: string | null;
}

export interface MediaUploadResult {
  uuid: string;
  url: string | null;
  original_name?: string;
  mime_type?: string;
  size?: number;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyResetOtpResult {
  reset_token: string;
  expires_at: string;
}

export interface ResetPasswordPayload {
  email: string;
  reset_token: string;
  password: string;
  password_confirmation: string;
}
