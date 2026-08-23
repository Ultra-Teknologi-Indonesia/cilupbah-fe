import { fetchClient } from "@/lib/api-client";
import type { ApiPaginated, ApiResponse } from "@/types/api.types";
import type {
  AppNotification,
  NotificationListParams,
  NotificationListResponse,
} from "@/types/notification";

export const NotificationService = {
  list: async (
    params: NotificationListParams = {},
  ): Promise<NotificationListResponse> => {
    const res = await fetchClient<ApiPaginated<AppNotification>>(
      "/notifications",
      {
        method: "GET",
        params: params as Record<string, string | number | boolean | undefined>,
      },
    );
    return {
      items: res.data,
      meta: res.meta,
    };
  },

  unreadCount: async () => {
    const res = await fetchClient<ApiResponse<{ count: number }>>(
      "/notifications/unread-count",
      { method: "GET" },
    );
    return res.data.count;
  },

  markAsRead: async (id: string) => {
    const res = await fetchClient<ApiResponse<AppNotification>>(
      `/notifications/${id}/read`,
      { method: "PATCH" },
    );
    return res.data;
  },

  markAllAsRead: async () => {
    await fetchClient<ApiResponse<null>>("/notifications/read-all", {
      method: "POST",
    });
  },

  remove: async (id: string) => {
    await fetchClient<ApiResponse<null>>(`/notifications/${id}`, {
      method: "DELETE",
    });
  },
};
