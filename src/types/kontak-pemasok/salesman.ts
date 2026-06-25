export interface SalesmanItem {
  id: string
  code: string
  name: string
  phone: string | null
  email: string | null
  status: "active" | "inactive"
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SalesmanListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[status]"?: string
  sort?: string
}

export interface SalesmanFormData {
  name: string
  code?: string
  phone?: string
  email?: string
  status?: "active" | "inactive"
  notes?: string
}
