export type DirectCompletionBlockReason =
  | "not_eligible"
  | "has_picklist"
  | "shadow"
  | "cancel_pending"
  | "awaiting_buyer_confirmation"
  | "stock_short"
  | "failed";

export interface DirectCompletionBin {
  bin_id: string;
  bin_code: string;
  on_hand: number;
}

export interface DirectCompletionDraw {
  bin_id: string;
  bin_code?: string;
  qty: number;
}

export interface DirectCompletionItem {
  item_id: string;
  sku: string;
  name: string;
  qty_required: number;
  qty_completable: number;
  qty_available: number;
  shortage: number;
  bins: DirectCompletionBin[];
  suggested: DirectCompletionDraw[];
}

export interface DirectCompletionShortage {
  item_id: string;
  order_item_id: string | null;
  sku: string;
  qty_short: number;
}

export interface DirectCompletionBlocked {
  order_id: string | null;
  salesorder_no: string | null;
  reason: DirectCompletionBlockReason;
  message: string;
  shortage?: DirectCompletionShortage[];
}

export interface DirectCompletionPreview {
  location_id: string;
  completable_order_ids: string[];
  items: DirectCompletionItem[];
  blocked: DirectCompletionBlocked[];
}

export interface DirectCompletionResult {
  completed: Array<{ order_id: string; salesorder_no: string | null }>;
  completed_count: number;
  blocked: DirectCompletionBlocked[];
  raised_confirmations: number;
}

export interface DirectCompletionAllocation {
  item_id: string;
  bins: Array<{ bin_id: string; qty: number }>;
}

export type BuyerConfirmationOutcome = "CANCEL" | "REPLACE" | "REMOVE" | "WAIT";

export interface BuyerConfirmation {
  id: string;
  order_id: string;
  order_item_id: string | null;
  salesorder_no?: string | null;
  customer_name?: string | null;
  order_date?: string | null;
  source?: string | null;
  item_id: string | null;
  sku?: string | null;
  qty_short: number;
  outcome: BuyerConfirmationOutcome | null;
  replacement_item_id: string | null;
  replacement_sku?: string | null;
  note: string | null;
  raised_at: string;
  confirmed_at: string | null;
  resolved_at: string | null;
}
