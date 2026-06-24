export type RawUserLocation = {
  location_id: string
  location_name: string
  zones: { id: string; zone_code: string; zone_name: string }[] | null
}

export type RawUser = {
  id: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
  nik: string | null
  warehouse_id: string | null
  locations: RawUserLocation[]
  avatar_media_id: string | null
  avatar_url: string | null
  last_login_at: string | null
}

export type RawRole = {
  id: string
  name: string
  description: string | null
  users_count?: number
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  name: string
  email: string
  roles: string[]
  nik: string | null
  warehouseId: string | null
  locations: UserLocation[]
  avatarUrl: string | null
  lastLoginAt: string | null
}

export type UserLocation = {
  locationId: string
  locationName: string
}

export type Role = {
  id: string
  name: string
  description: string | null
}

export type UserListParams = {
  search?: string
  page?: number
  perPage?: number
}

export type UserFormPayload = {
  name: string
  email: string
  password?: string
  password_confirmation?: string
  roles: string[]
  nik?: string | null
  warehouse_id?: string | null
}
