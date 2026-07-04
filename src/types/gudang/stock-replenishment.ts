export type StockReplenishmentStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "DONE";

export interface StockReplenishmentItem {
  id: string;
  item_id: string;
  sku: string;
  qty: number;
  reason: string | null;
}

export interface StockReplenishment {
  id: string;
  status: StockReplenishmentStatus;
  from_location_id: string;
  to_location_id: string;
  from_location_name: string | null;
  to_location_name: string | null;
  requested_by_user_id: string | null;
  requested_by_name: string | null;
  assignee_user_id: string | null;
  assignee_name: string | null;
  transfer_out_id: string | null;
  transfer_out_number: string | null;
  transfer_out_status: string | null;
  requested_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  done_at: string | null;
  reject_reason: string | null;
  note: string | null;
  items?: StockReplenishmentItem[];
  created_at?: string;
  updated_at?: string;
}

export interface StockReplenishmentListParams {
  status?: StockReplenishmentStatus;
  page?: number;
  per_page?: number;
}

export interface AcceptReplenishmentPayload {
  assignee_user_id?: string | null;
  note?: string | null;
}
