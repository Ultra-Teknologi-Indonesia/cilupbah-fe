import { fetchClient } from "@/lib/api-client";
import type { LoginRequest, LoginResponse } from "@/types/auth/auth.types";

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return fetchClient<LoginResponse>("/auth/login", {
      method: "POST",
      data: credentials,
    });
  },

};
