import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { LoginRequest, LoginResponse } from "@/types/auth/auth.types";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  /**
   * Gabungan hak akses dari role + langsung (override per-user). Untuk owner,
   * backend mengirim seluruh permission. Dipakai oleh `usePermissions()`.
   */
  permissions: string[];
  warehouse_id?: string | null;
  locations?: { location_id: string; location_name: string }[];
}

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return fetchClient<LoginResponse>("/auth/login", {
      method: "POST",
      data: credentials,
    });
  },

  logout: async (): Promise<void> => {
    await fetchClient("/auth/logout", { method: "POST" });
  },

  profile: async (): Promise<CurrentUser> => {
    const res = await fetchClient<ApiResponse<CurrentUser>>("/profile");
    return res.data;
  },
};
