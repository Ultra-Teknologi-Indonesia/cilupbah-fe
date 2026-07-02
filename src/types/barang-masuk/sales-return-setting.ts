export interface SalesReturnSetting {
  auto_accept: boolean
  auto_receive: boolean
  default_restock_location_id: string | null
  allowed_conditions: string[]
  allowed_refund_methods: string[]
  return_validity_days: number | null
  updated_at?: string
}

export interface SalesReturnSettingPayload {
  auto_accept?: boolean
  auto_receive?: boolean
  default_restock_location_id?: string | null
  allowed_conditions?: string[]
  allowed_refund_methods?: string[]
  return_validity_days?: number | null
}
