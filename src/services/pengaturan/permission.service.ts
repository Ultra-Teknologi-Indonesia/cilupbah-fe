import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { PermissionGroup } from "@/types/pengaturan/permission";

export const PermissionService = {
  /** Katalog izin bergrup untuk matriks Hak Akses. */
  catalog: async (): Promise<PermissionGroup[]> => {
    const res = await fetchClient<ApiResponse<PermissionGroup[]>>(
      "/permissions/catalog",
    );
    return res.data;
  },
};
