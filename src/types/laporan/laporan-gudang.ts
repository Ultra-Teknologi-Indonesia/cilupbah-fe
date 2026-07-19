export type TransferReportJenis = "masuk" | "keluar";

export interface TransferReportParams {
  jenis: TransferReportJenis;
  from: string;
  to: string;
  item_ids?: string[];
}
