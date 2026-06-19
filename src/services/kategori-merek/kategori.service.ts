import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type {
  KategoriItem,
  KategoriMappingItem,
  CategoryFormAttributes,
  ChannelAttributeItem,
  ChannelCategoryNode,
} from "@/types/kategori-merek/kategori"

export const KategoriService = {
  getEnabledTree: async (): Promise<KategoriItem[]> => {
    const res = await fetchClient<ApiResponse<KategoriItem[]>>(
      "/categories?all=1&include[]=children.children.children"
    )
    return (res.data ?? []).filter((item) => item.parent_id === null)
  },

  getSystemCategories: async (): Promise<KategoriItem[]> => {
    const res = await fetchClient<ApiResponse<KategoriItem[]>>(
      "/categories/system?include[]=children.children.children"
    )
    return res.data ?? []
  },

  enableCategories: async (ids: number[]): Promise<{ enabled_count: number }> => {
    const res = await fetchClient<ApiResponse<{ enabled_count: number }>>(
      "/categories/enable",
      { method: "POST", data: { ids } }
    )
    return res.data
  },

  disableCategories: async (ids: number[]): Promise<{ disabled_count: number }> => {
    const res = await fetchClient<ApiResponse<{ disabled_count: number }>>(
      "/categories/disable",
      { method: "POST", data: { ids } }
    )
    return res.data
  },

  createCategory: async (data: {
    name: string
    parent_id?: number | null
    is_active?: boolean
  }): Promise<KategoriItem> => {
    const res = await fetchClient<ApiResponse<KategoriItem>>("/categories", {
      method: "POST",
      data,
    })
    return res.data
  },

  searchCategories: async (search: string): Promise<KategoriItem[]> => {
    const res = await fetchClient<ApiResponse<KategoriItem[]>>(
      `/categories?all=1&search=${encodeURIComponent(search)}`
    )
    return res.data ?? []
  },

  updateCategory: async (id: number, data: { name: string }): Promise<KategoriItem> => {
    const res = await fetchClient<ApiResponse<KategoriItem>>(`/categories/${id}`, {
      method: "PUT",
      data,
    })
    return res.data
  },

  deleteCategory: async (id: number): Promise<void> => {
    await fetchClient(`/categories/${id}`, { method: "DELETE" })
  },

  getCategoryFormAttributes: async (categoryId: number): Promise<CategoryFormAttributes> => {
    const res = await fetchClient<ApiResponse<CategoryFormAttributes>>(
      `/categories/${categoryId}/form-attributes`
    )
    return res.data
  },

  createCategoryAttribute: async (
    categoryId: number,
    data: { name: string; type: "spec" | "sales" }
  ): Promise<void> => {
    await fetchClient(`/categories/${categoryId}/attributes`, {
      method: "POST",
      data,
    })
  },

  deleteCategoryAttribute: async (
    categoryId: number,
    attributeId: number
  ): Promise<void> => {
    await fetchClient(`/categories/${categoryId}/attributes/${attributeId}`, {
      method: "DELETE",
    })
  },

  getChannelAttributes: async (
    channelCode: string,
    categoryId: number
  ): Promise<ChannelAttributeItem[]> => {
    const res = await fetchClient<ApiResponse<ChannelAttributeItem[]>>(
      `/${channelCode}/categories/${categoryId}/attributes`
    )
    return res.data ?? []
  },

  mapAttributeToChannel: async (
    attributeId: number,
    channelAttributeIds: string[]
  ): Promise<void> => {
    await fetchClient(`/attributes/${attributeId}/map-channel`, {
      method: "POST",
      data: { channel_attribute_ids: channelAttributeIds },
    })
  },

  getChannelCategories: async (channelId: string): Promise<ChannelCategoryNode[]> => {
    const res = await fetchClient<ApiResponse<ChannelCategoryNode[]>>(
      `/${channelId}/categories?all=1`
    )
    return res.data ?? []
  },

  mapCategoryToChannel: async (
    categoryId: number,
    channelCategoryIds: string[]
  ): Promise<void> => {
    await fetchClient(`/categories/${categoryId}/map-channel`, {
      method: "POST",
      data: { channel_category_ids: channelCategoryIds },
    })
  },

  syncChannelCategories: async (
    channelCode: string,
    shopId: string
  ): Promise<number> => {
    const res = await fetchClient<ApiResponse<{ synced: number }>>(
      `/${channelCode}/sync/categories`,
      { method: "POST", data: { shop_id: shopId } }
    )
    return res.data?.synced ?? 0
  },

  getMappingList: async (params: {
    search?: string
    page?: number
    perPage?: number
  } = {}): Promise<{ items: KategoriMappingItem[]; meta: { current_page: number; last_page: number; total: number } }> => {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    q.set("page", String(params.page ?? 1))
    q.set("per_page", String(params.perPage ?? 15))

    const qs = q.toString()
    const res = await fetchClient<ApiPaginated<KategoriMappingItem>>(
      `/categories/mapping${qs ? `?${qs}` : ""}`
    )
    return {
      items: res.data ?? [],
      meta: res.meta,
    }
  },
}
