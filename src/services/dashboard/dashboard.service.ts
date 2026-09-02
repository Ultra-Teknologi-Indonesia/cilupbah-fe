import { fetchClient } from "@/lib/api-client";
import type { ApiResponse, ApiPaginated } from "@/types/api.types";
import type {
  DashboardSummary,
  DashboardSummaryParams,
  DashboardQueue,
  DashboardQueueRow,
  DashboardQueueParams,
} from "@/types/dashboard/dashboard";

export const DashboardService = {
  summary: async (params: DashboardSummaryParams = {}) => {
    const sp = new URLSearchParams();
    if (params.date_from) sp.set("date_from", params.date_from);
    if (params.date_to) sp.set("date_to", params.date_to);
    if (params.location_id) sp.set("location_id", params.location_id);

    const qs = sp.toString();
    const res = await fetchClient<ApiResponse<DashboardSummary>>(
      `/dashboard/summary${qs ? `?${qs}` : ""}`,
    );
    return res.data;
  },

  queue: async (queue: DashboardQueue, params: DashboardQueueParams = {}) => {
    const sp = new URLSearchParams();
    if (params.page) sp.set("page", String(params.page));
    if (params.per_page) sp.set("per_page", String(params.per_page));
    if (params.location_id) sp.set("location_id", params.location_id);

    const qs = sp.toString();
    const res = await fetchClient<ApiPaginated<DashboardQueueRow>>(
      `/dashboard/queues/${queue}${qs ? `?${qs}` : ""}`,
    );
    return { items: res.data ?? [], meta: res.meta };
  },
};
