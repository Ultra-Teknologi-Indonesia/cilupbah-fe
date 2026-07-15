export type BulkLabelBatchStatus = "processing" | "ready" | "failed";

export type BulkLabelItemStatus =
  | "pending"
  | "downloading"
  | "waiting_shopee_prep"
  | "done"
  | "failed"
  | "skipped_instant";

export interface BulkLabelBatchItem {
  id?: string;
  order_id: string;
  salesorder_no?: string | null;
  channel: string;
  channel_order_no?: string | null;
  no_paket?: string | null;
  courier_name?: string | null;
  tracking_number?: string | null;
  tgl_pesanan?: string | null;
  tgl_pengiriman?: string | null;
  status: BulkLabelItemStatus;
  status_label?: string;
  status_message?: string;
  reason: string | null;
  is_instant?: boolean;
  is_retryable?: boolean;
  is_terminal?: boolean;
}

export interface BulkLabelBatch {
  id: string;
  status: BulkLabelBatchStatus;
  total: number;
  done: number;
  failed: number;
  skipped?: number;
  waiting_shopee: number;
  retryable_count?: number;
  started_at: string | null;
  finished_at: string | null;
  items: BulkLabelBatchItem[];
  pdf_url: string | null;
}

export interface BulkLabelCreateResponse {
  batch_id: string;
}

export interface BulkLabelRetryResponse {
  batch_id: string;
  retried_count?: number;
}
