import { fetchClient } from "@/lib/api-client"
import type {
  RawUser,
  RawUserListResponse,
  User,
  UserFormPayload,
  UserListParams,
  UserRole,
  UserLocation,
} from "@/types/pengaturan/user"

function mapRole(raw: { role_id: number; role_name: string }): UserRole {
  return {
    roleId: raw.role_id,
    roleName: raw.role_name.trim(),
  }
}

function mapLocation(raw: { location_id: number; location_name: string }): UserLocation {
  return {
    locationId: raw.location_id,
    locationName: raw.location_name,
  }
}

function mapUser(raw: RawUser): User {
  return {
    id: String(raw.user_id),
    email: raw.email,
    fullName: raw.full_name,
    lastLogin: raw.last_login,
    isOwner: raw.is_owner,
    roles: (raw.roles ?? []).map(mapRole),
    locations: (raw.locations ?? []).map(mapLocation),
  }
}

export const UserService = {
  list: async (params: UserListParams = {}) => {
    const qs = new URLSearchParams({
      pageSize: String(params.perPage ?? 10),
      page: String(params.page ?? 1),
    })
    if (params.search) qs.set("q", params.search)

    const res = await fetchClient<RawUserListResponse>(
      `/systemsetting/users?${qs.toString()}`
    )
    return {
      items: (res.data ?? []).map(mapUser),
      totalCount: res.totalCount ?? 0,
    }
  },

  detail: async (id: string) => {
    const res = await fetchClient<RawUserListResponse>(
      `/systemsetting/users?pageSize=200&page=1`
    )
    const raw = (res.data ?? []).find((u) => String(u.user_id) === id)
    if (!raw) throw new Error("Pengguna tidak ditemukan")
    return mapUser(raw)
  },

  create: async (payload: UserFormPayload) => {
    return fetchClient<{ data: RawUser }>("/systemsetting/users", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  update: async (id: string, payload: UserFormPayload) => {
    return fetchClient<{ data: RawUser }>(`/systemsetting/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  delete: async (id: string) => {
    return fetchClient(`/systemsetting/users/${id}`, { method: "DELETE" })
  },
}
