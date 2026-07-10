import { fetchClient } from "@/lib/api-client";
import type { ApiPaginated, ApiResponse } from "@/types/api.types";
import type { RawRole, Role, RoleFormPayload } from "@/types/pengaturan/user";

function mapRole(raw: RawRole): Role {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    usersCount: raw.users_count,
    permissions: raw.permissions,
  };
}

export const RoleService = {
  list: async (): Promise<Role[]> => {
    const res = await fetchClient<ApiPaginated<RawRole>>("/roles?per_page=100");
    return (res.data ?? []).map(mapRole);
  },

  detail: async (id: string): Promise<Role> => {
    const res = await fetchClient<ApiResponse<RawRole>>(`/roles/${id}`);
    return mapRole(res.data);
  },

  create: async (payload: RoleFormPayload): Promise<Role> => {
    const res = await fetchClient<ApiResponse<RawRole>>("/roles", {
      method: "POST",
      data: payload,
    });
    return mapRole(res.data);
  },

  update: async (id: string, payload: RoleFormPayload): Promise<Role> => {
    const res = await fetchClient<ApiResponse<RawRole>>(`/roles/${id}`, {
      method: "PUT",
      data: payload,
    });
    return mapRole(res.data);
  },

  delete: async (id: string): Promise<void> => {
    await fetchClient<ApiResponse<null>>(`/roles/${id}`, { method: "DELETE" });
  },

  syncPermissions: async (id: string, permissions: string[]): Promise<Role> => {
    const res = await fetchClient<ApiResponse<RawRole>>(
      `/roles/${id}/permissions`,
      { method: "PUT", data: { permissions } },
    );
    return mapRole(res.data);
  },
};
