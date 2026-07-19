export type TransferReportJenis = "masuk" | "keluar";

export interface TransferReportParams {
  jenis: TransferReportJenis;
  from: string;
  to: string;
  item_ids?: string[];
}

export type PicklistReportMode = "tanggal" | "no_picklist";

export interface PicklistExportParams {
  from: string;
  to: string;
}

export interface PicklistDetailPdfParams {
  picklist_id: string;
  order_ids?: string[];
}

export interface PicklistLookupOrder {
  value: string;
  label: string;
}

export interface PicklistLookupItem {
  value: string;
  label: string;
  orders: PicklistLookupOrder[];
}
