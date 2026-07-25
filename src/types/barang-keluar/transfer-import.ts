export interface TransferImportItemRow {
  sku: string;
  product_name: string;
  qty: number;
  kode_rak: string;
}

export interface TransferImportDoc {
  ref_no: string;
  transaction_date: string | null;
  source_location: string;
  destination_location: string;
  notes: string | null;
  item_count: number;
  items: TransferImportItemRow[];
  status: "ready" | "error";
  errors: string[];
}

export interface TransferImportIssue {
  row: number;
  field: string;
  error?: string;
  warning?: string;
}

export interface TransferImportSummary {
  total_rows: number;
  total_docs: number;
  valid_docs: number;
  errors: number;
  warnings: number;
}

export interface TransferImportPreview {
  token: string;
  transfers: TransferImportDoc[];
  errors: TransferImportIssue[];
  warnings: TransferImportIssue[];
  summary: TransferImportSummary;
}

export interface TransferImportConfirmResult {
  created: number;
  failed: number;
  transfer_numbers: string[];
  errors: string[];
}
