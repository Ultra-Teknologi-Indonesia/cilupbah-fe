export type ImpexDirection = "import" | "export";
export type ImpexStatus = "pending" | "processing" | "success" | "failed";

export interface ImpexActivity {
  id: string;
  activityType: string;
  startedAt: string | null;
  completedAt: string | null;
  locationName: string | null;
  performedBy: string | null;
  progressPercentage: number | null;
  status: ImpexStatus;
  fileUrl: string | null;
  errorMessage: string | null;
}

export interface RawImpexActivity {
  id: string;
  activity_type: string;
  started_at: string | null;
  completed_at: string | null;
  location_name: string | null;
  performed_by: string | null;
  progress_percentage: number | null;
  status: ImpexStatus;
  file_url: string | null;
  error_message: string | null;
}

export interface ImpexActivityDetail {
  id: string;
  description: string;
}

export interface ImpexActivityListParams {
  status?: ImpexStatus;
  myOnly?: boolean;
  page?: number;
  perPage?: number;
}
