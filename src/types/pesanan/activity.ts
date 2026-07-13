export interface OrderActivity {
  id: string;
  action_date: string;
  email: string;
  actor_name: string | null;
  entity_no: string | null;
  action: "C" | "U" | "D";
  action_id: string;
  action_label: string;
  note: string | null;
  prev_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
}

export interface OrderActivityMeta {
  next_cursor: string | null;
  prev_cursor: string | null;
  per_page: number;
  has_more: boolean;
}

export interface OrderActivityResponse {
  data: OrderActivity[];
  meta: OrderActivityMeta;
}
