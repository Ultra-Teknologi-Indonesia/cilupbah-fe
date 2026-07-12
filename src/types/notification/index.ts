export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  data: (Record<string, unknown> & { link?: string }) | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationListParams {
  is_read?: boolean;
  per_page?: number;
  page?: number;
}

export interface NotificationListResponse {
  items: AppNotification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
