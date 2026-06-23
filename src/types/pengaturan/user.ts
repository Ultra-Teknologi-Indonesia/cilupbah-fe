export type RawUserRole = {
  user_id: number
  company_id: number
  role_id: number
  role_name: string
}

export type RawUserLocation = {
  user_loc_id: number
  user_id: number
  location_id: number
  location_name: string
}

export type RawUser = {
  user_id: number
  email: string
  last_login: string | null
  full_name: string
  is_owner: boolean
  roles: RawUserRole[]
  locations: RawUserLocation[] | null
}

export type RawUserListResponse = {
  data: RawUser[]
  totalCount: number
}

export type UserRole = {
  roleId: number
  roleName: string
}

export type UserLocation = {
  locationId: number
  locationName: string
}

export type User = {
  id: string
  email: string
  fullName: string
  lastLogin: string | null
  isOwner: boolean
  roles: UserRole[]
  locations: UserLocation[]
}

export type UserListParams = {
  search?: string
  page?: number
  perPage?: number
}

export type UserFormPayload = {
  full_name: string
  email: string
  password?: string
  role_ids: number[]
  location_ids: number[]
}
