export interface ContactCategory {
  id: string
  name: string
  description: string | null
}

export interface AccountPayableOption {
  code: string
  name: string
}

export interface ContactItem {
  id: string
  code: string
  name: string
  company_name: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  tax_id: string | null
  contact_person: string | null
  payment_term: string
  notes: string | null
  status: "active" | "inactive"
  type: "CUSTOMER" | "SUPPLIER" | "BOTH"
  is_system: boolean
  is_company: boolean
  account_payable: string | null
  category: ContactCategory | null
  created_at: string
  updated_at: string
}

export interface ContactListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[status]"?: string
  "filter[type]"?: string
  "filter[category_id]"?: string
  sort?: string
}

export interface ContactFormData {
  name: string
  company_name?: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  tax_id?: string
  contact_person?: string
  payment_term?: string
  notes?: string
  type: "SUPPLIER" | "BOTH"
  category_id?: string
  is_company?: boolean
  account_payable?: string
}
