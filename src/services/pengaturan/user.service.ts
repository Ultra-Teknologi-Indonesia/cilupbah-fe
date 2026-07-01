import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"
import type {
  RawUser,
  RawRole,
  RawLoginHistory,
  User,
  Role,
  LoginHistory,
  UserFormPayload,
  UserListParams,
  LoginHistoryParams,
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

function mapLoginHistory(raw: RawLoginHistory): LoginHistory {
  return {
    id: raw.id,
    userId: raw.user_id,
    device: raw.agent_device,
    os: raw.agent_os,
    browser: raw.agent_browser,
    ipAddress: raw.ip_address,
    country: raw.location_country,
    region: raw.location_region,
    city: raw.location_city,
    createdAt: raw.created_at,
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
    if (params["filter[role]"]) {
      const roles = params["filter[role]"]
      if (Array.isArray(roles)) {
        roles.forEach((r) => qs.append("filter[role]", r))
      } else {
        qs.set("filter[role]", roles)
      }
    }

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

  loginHistory: async (userId: string, params: LoginHistoryParams = {}) => {
    const qs = new URLSearchParams()
    qs.set("page", String(params.page ?? 1))
    qs.set("page_size", String(params.pageSize ?? 25))

    const res = await fetchClient<ApiPaginated<RawLoginHistory>>(
      `/users/${userId}/login-history?${qs.toString()}`
    )
    return {
      items: (res.data ?? []).map(mapLoginHistory),
      meta: res.meta,
    }
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
