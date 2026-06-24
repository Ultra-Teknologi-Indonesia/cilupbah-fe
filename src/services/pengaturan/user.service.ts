import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"
import type {
  RawUser,
  RawRole,
  User,
  Role,
  UserFormPayload,
  UserListParams,
} from "@/types/pengaturan/user"

function mapUser(raw: RawUser): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    roles: raw.roles,
    nik: raw.nik,
    warehouseId: raw.warehouse_id,
    locations: (raw.locations ?? []).map((l) => ({
      locationId: l.location_id,
      locationName: l.location_name,
    })),
    avatarUrl: raw.avatar_url,
    lastLoginAt: raw.last_login_at,
  }
}

function mapRole(raw: RawRole): Role {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
  }
}

export const UserService = {
  list: async (params: UserListParams = {}) => {
    const qs = new URLSearchParams()
    qs.set("page", String(params.page ?? 1))
    qs.set("per_page", String(params.perPage ?? 10))
    if (params.search) qs.set("search", params.search)

    const res = await fetchClient<ApiPaginated<RawUser>>(
      `/users?${qs.toString()}`
    )
    return {
      items: (res.data ?? []).map(mapUser),
      meta: res.meta,
    }
  },

  detail: async (id: string) => {
    const res = await fetchClient<ApiResponse<RawUser>>(`/users/${id}`)
    return mapUser(res.data)
  },

  create: async (payload: UserFormPayload) => {
    const res = await fetchClient<ApiResponse<RawUser>>("/users", {
      method: "POST",
      data: payload,
    })
    return mapUser(res.data)
  },

  update: async (id: string, payload: UserFormPayload) => {
    const res = await fetchClient<ApiResponse<RawUser>>(`/users/${id}`, {
      method: "PUT",
      data: payload,
    })
    return mapUser(res.data)
  },

  delete: async (id: string) => {
    await fetchClient<ApiResponse<null>>(`/users/${id}`, { method: "DELETE" })
  },

  roles: async (): Promise<Role[]> => {
    const res = await fetchClient<ApiPaginated<RawRole>>(
      "/roles?per_page=100"
    )
    return (res.data ?? [])
      .map(mapRole)
      .filter((r) => r.name !== "owner")
  },
}
