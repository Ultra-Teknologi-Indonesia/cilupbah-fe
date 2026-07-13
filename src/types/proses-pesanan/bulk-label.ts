export type BulkLabelBatchStatus = "processing" | "ready" | "failed";

export type BulkLabelItemStatus =
  | "pending"
  | "downloading"
  | "waiting_shopee_prep"
  | "done"
  | "failed";

export interface BulkLabelBatchItem {
  order_id: string;
  channel: string;
  status: BulkLabelItemStatus;
  reason: string | null;
}

export interface BulkLabelBatch {
  id: string;
  status: BulkLabelBatchStatus;
  total: number;
  done: number;
  failed: number;
  waiting_shopee: number;
  started_at: string | null;
  finished_at: string | null;
  items: BulkLabelBatchItem[];
  pdf_url: string | null;
}

export interface BulkLabelCreateResponse {
  batch_id: string;
}
