import type { LookupOption } from "@/types/common"


export interface TaxLookup {
  options: LookupOption[]
  rateById: Record<string, number>
}


export interface RawTax {
  id: number | string
  name: string
  rate: number
}

export interface RawAccount {
  account_id: string
  account_code: string
  account_name: string
  account_type: string
}

export interface RawBrand {
  id: number | string
  name: string
}

export interface RawCategory {
  id: number | string
  parent_id: number | string | null
  name: string
  children?: RawCategory[]
}

export interface RawShop {
  id: string
  shop_name?: string | null
  shop_id?: string | null
  channel?: { name?: string | null } | null
  channel_name?: string | null
}
