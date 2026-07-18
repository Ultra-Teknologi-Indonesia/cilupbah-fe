import { fetchClient } from "@/lib/api-client";
import type { ApiPaginated, ApiResponse } from "@/types/api.types";
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginHistoryEntry,
  LoginRequest,
  LoginResponse,
  MediaUploadResult,
  MyProfile,
  ResetPasswordPayload,
  UpdateProfilePayload,
  UserHistoryEntry,
  UserSession,
  VerifyResetOtpPayload,
  VerifyResetOtpResult,
} from "@/types/auth/auth.types";

export type CurrentUser = MyProfile;

export interface HistoryParams {
  page?: number;
  per_page?: number;
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

  unlock: async (password: string): Promise<void> => {
    await fetchClient("/auth/unlock", {
      method: "POST",
      data: { password },
    });
  },

  profile: async (): Promise<CurrentUser> => {
    const res = await fetchClient<ApiResponse<CurrentUser>>("/profile");
    return res.data;
  },

  updateProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<CurrentUser> => {
    const res = await fetchClient<ApiResponse<CurrentUser>>("/profile", {
      method: "PUT",
      data: payload,
    });
    return res.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await fetchClient("/profile/password", {
      method: "PUT",
      data: payload,
    });
  },

  uploadMedia: async (file: File): Promise<MediaUploadResult> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetchClient<ApiResponse<MediaUploadResult>>(
      "/media/upload",
      {
        method: "POST",
        data: form,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  updateAvatar: async (mediaUuid: string | null): Promise<CurrentUser> => {
    const res = await fetchClient<ApiResponse<CurrentUser>>("/profile/avatar", {
      method: "PUT",
      data: { media_uuid: mediaUuid },
    });
    return res.data;
  },

  sessions: async (): Promise<UserSession[]> => {
    const res = await fetchClient<ApiResponse<UserSession[]>>(
      "/profile/sessions",
    );
    return res.data;
  },

  revokeSession: async (id: string): Promise<void> => {
    await fetchClient(`/profile/sessions/${id}/revoke`, { method: "POST" });
  },

  revokeOtherSessions: async (): Promise<number> => {
    const res = await fetchClient<ApiResponse<{ revoked: number }>>(
      "/profile/sessions/revoke-others",
      { method: "POST" },
    );
    return res.data.revoked;
  },

  myHistories: async (
    params: HistoryParams,
  ): Promise<ApiPaginated<UserHistoryEntry>> => {
    return fetchClient<ApiPaginated<UserHistoryEntry>>("/profile/histories", {
      params,
    });
  },

  myLoginHistories: async (
    params: HistoryParams,
  ): Promise<ApiPaginated<LoginHistoryEntry>> => {
    return fetchClient<ApiPaginated<LoginHistoryEntry>>(
      "/profile/login-histories",
      { params },
    );
  },

  forgotPassword: async (
    payload: ForgotPasswordPayload,
  ): Promise<ApiResponse<null>> => {
    return fetchClient<ApiResponse<null>>("/auth/forgot-password", {
      method: "POST",
      data: payload,
    });
  },

  verifyResetOtp: async (
    payload: VerifyResetOtpPayload,
  ): Promise<ApiResponse<VerifyResetOtpResult>> => {
    return fetchClient<ApiResponse<VerifyResetOtpResult>>(
      "/auth/forgot-password/verify-otp",
      { method: "POST", data: payload },
    );
  },

  resetPassword: async (
    payload: ResetPasswordPayload,
  ): Promise<ApiResponse<null>> => {
    return fetchClient<ApiResponse<null>>("/auth/forgot-password/reset", {
      method: "POST",
      data: payload,
    });
  },
};
