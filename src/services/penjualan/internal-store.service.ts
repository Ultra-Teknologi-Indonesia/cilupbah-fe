import { fetchClient } from "@/lib/api-client";
import type { ApiPaginated, ApiResponse } from "@/types/api.types";
import type {
  InternalStore,
  InternalStoreFormData,
  InternalStoreListParams,
} from "@/types/penjualan/internal-store";

const BASE = "/sales/internal-stores";

export const InternalStoreService = {
  list: async (params: InternalStoreListParams = {}) => {
    const sp = new URLSearchParams();
    if (params.page) sp.set("page", String(params.page));
    if (params.per_page) sp.set("per_page", String(params.per_page));
    if (params.search) sp.set("search", params.search);
    if (params["filter[is_active]"] !== undefined)
      sp.set("filter[is_active]", String(Number(!!params["filter[is_active]"])));
    if (params.sort) sp.set("sort", params.sort);
    const qs = sp.toString();
    const res = await fetchClient<ApiPaginated<InternalStore>>(
      qs ? `${BASE}?${qs}` : BASE,
    );
    return { items: res.data ?? [], meta: res.meta };
  },

  all: async () => {
    const res = await fetchClient<ApiResponse<InternalStore[]>>(`${BASE}/all`);
    return res.data ?? [];
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<InternalStore>>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: InternalStoreFormData, logo?: File | null) => {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("is_active", data.is_active ? "1" : "0");
    if (logo) fd.append("logo", logo);
    const res = await fetchClient<ApiResponse<InternalStore>>(BASE, {
      method: "POST",
      data: fd,
    });
    return res.data;
  },

  update: async (
    id: string,
    data: Partial<InternalStoreFormData>,
    logo?: File | null,
  ) => {
    if (logo) {
      const fd = new FormData();
      fd.append("_method", "PUT");
      if (data.name !== undefined) fd.append("name", data.name);
      if (data.is_active !== undefined)
        fd.append("is_active", data.is_active ? "1" : "0");
      fd.append("logo", logo);
      const res = await fetchClient<ApiResponse<InternalStore>>(
        `${BASE}/${id}`,
        { method: "POST", data: fd },
      );
      return res.data;
    }

    const res = await fetchClient<ApiResponse<InternalStore>>(`${BASE}/${id}`, {
      method: "PUT",
      data,
    });
    return res.data;
  },

  delete: async (id: string) => {
    await fetchClient(`${BASE}/${id}`, { method: "DELETE" });
  },

  uploadLogo: async (id: string, file: File) => {
    const fd = new FormData();
    fd.append("logo", file);
    const res = await fetchClient<ApiResponse<InternalStore>>(
      `${BASE}/${id}/logo`,
      { method: "POST", data: fd },
    );
    return res.data;
  },

  deleteLogo: async (id: string) => {
    const res = await fetchClient<ApiResponse<InternalStore>>(
      `${BASE}/${id}/logo`,
      { method: "DELETE" },
    );
    return res.data;
  },
};
