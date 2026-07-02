export type ReturnSettlementStatus = "DRAFT" | "CONFIRMED" | "COMPLETED"

export interface ReturnSettlementRefund {
  id: string
  settlement_id: string
  refund_number: string
  amount: number | string
  refund_method: string
  refund_date: string
  notes: string | null
}

export interface ReturnSettlementInvoice {
  id: string
  settlement_id: string
  invoice_id: string
  amount: number | string
  invoice?: { id: string; invoice_number?: string } | null
}

export interface ReturnSettlement {
  id: string
  settlement_number: string
  return_id: string
  status: ReturnSettlementStatus
  total_amount: number | string
  notes: string | null
  created_by: string | null
  created_at?: string
  refunds?: ReturnSettlementRefund[]
  invoices?: ReturnSettlementInvoice[]
}

export interface CreateRefundPayload {
  settlement_id: string
  refund_number: string
  amount: number
  refund_method: string
  refund_date: string
  notes?: string
}

export interface CreateInvoiceDeductionPayload {
  settlement_id: string
  invoice_id: string
  amount: number
}
