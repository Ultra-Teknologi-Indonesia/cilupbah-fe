export type PurchaseActivityEntity = "ORDER" | "ITEM";

export type PurchaseActivityAction =
  | "CREATED"
  | "FIELD_CHANGED"
  | "ITEM_ADDED"
  | "ITEM_CHANGED"
  | "ITEM_REMOVED"
  | "RECEIPT_REVERSED"
  | "RECEIVED"
  | "STATUS_CHANGED";

export interface PurchaseOrderActivity {
  id: string;
  entity_type: PurchaseActivityEntity;
  entity_id: string | null;
  action: PurchaseActivityAction;
  action_id: string;
  label: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  entity_no: string | null;
  note: string | null;
  qty: number | null;
  prev_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

export interface PurchaseOrderActivityMeta {
  next_cursor: string | null;
  prev_cursor: string | null;
  per_page: number;
  has_more: boolean;
}

export interface PurchaseOrderActivityResponse {
  data: PurchaseOrderActivity[];
  meta: PurchaseOrderActivityMeta;
}
