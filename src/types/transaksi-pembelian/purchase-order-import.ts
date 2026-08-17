export interface PurchaseImportItem {
  row_no: number;
  item_id: string;
  sku: string;
  product_name: string;
  qty: number;
  unit_price: number;
  disc: number;
  disc_amount: number;
  tax_id: string | null;
  tax_name: string;
  tax_amount: number;
  amount: number;
}

export interface PurchaseImportDoc {
  po_number: string;
  ref_no: string | null;
  supplier_name: string;
  location_name: string;
  order_date: string;
  is_tax_included: boolean;
  notes: string | null;
  item_count: number;
  sub_total: number;
  total_disc: number;
  total_tax: number;
  total_amount: number;
  status: "ready" | "error";
  errors: string[];
  items: PurchaseImportItem[];
}

export interface PurchaseImportError {
  row: number;
  field: string;
  error: string;
}

export interface PurchaseImportWarning {
  row: number;
  field: string;
  warning: string;
}

export interface PurchaseImportSummary {
  total_rows: number;
  total_docs: number;
  valid_docs: number;
  invalid_docs: number;
  errors: number;
  warnings: number;
}

export interface PurchaseImportPreview {
  token: string;
  documents: PurchaseImportDoc[];
  errors: PurchaseImportError[];
  warnings: PurchaseImportWarning[];
  summary: PurchaseImportSummary;
}

export interface PurchaseImportConfirmResult {
  created: number;
  failed: number;
  po_numbers: string[];
  errors: string[];
}
