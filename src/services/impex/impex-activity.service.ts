import { fetchClient } from "@/lib/api-client";
import type { ApiPaginated, ApiResponse } from "@/types/api.types";
import type {
  ImpexActivity,
  ImpexActivityDetail,
  ImpexActivityListParams,
  ImpexDirection,
  RawImpexActivity,
} from "@/types/impex";

function mapActivity(raw: RawImpexActivity): ImpexActivity {
  return {
    id: raw.id,
    activityType: raw.activity_type,
    startedAt: raw.started_at,
    completedAt: raw.completed_at,
    locationName: raw.location_name,
    performedBy: raw.performed_by,
    progressPercentage: raw.progress_percentage,
    status: raw.status,
    fileUrl: raw.file_url,
    errorMessage: raw.error_message,
  };
}

type PageMeta = ApiPaginated<unknown>["meta"];

export const ImpexActivityService = {
  list: async (
    direction: ImpexDirection,
    params: ImpexActivityListParams = {},
  ): Promise<{ items: ImpexActivity[]; meta: PageMeta }> => {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page ?? 1));
    qs.set("per_page", String(params.perPage ?? 25));
    if (params.status) qs.set("status", params.status);
    if (params.myOnly) qs.set("my_only", "true");

    const res = await fetchClient<ApiPaginated<RawImpexActivity>>(
      `/impex/activities/${direction}?${qs.toString()}`,
    );
    return { items: (res.data ?? []).map(mapActivity), meta: res.meta };
  },

  details: async (
    direction: ImpexDirection,
    activityId: string,
  ): Promise<ImpexActivityDetail[]> => {
    const res = await fetchClient<ApiResponse<ImpexActivityDetail[]>>(
      `/impex/activities/${direction}/${activityId}/details`,
    );
    return res.data ?? [];
  },
};
