export type ExportJobState = "queued" | "processing" | "ready" | "failed";

export interface ExportJobStatus {
  id: string;
  type: string;
  status: ExportJobState;
  file_name: string | null;
  error: string | null;
  download_url: string | null;
}
