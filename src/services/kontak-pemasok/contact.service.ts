import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type {
  ContactItem,
  ContactCategory,
  ContactListParams,
  ContactFormData,
  CategoryFormData,
  AccountPayableOption,
} from "@/types/kontak-pemasok/contact"

export const ContactService = {
  list: async (params: ContactListParams = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set("search", params.search)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
    if (params["filter[type]"]) sp.set("filter[type]", params["filter[type]"])
    if (params["filter[category_id]"]) sp.set("filter[category_id]", params["filter[category_id]"])
    if (params.sort) sp.set("sort", params.sort)

    const res = await fetchClient<ApiPaginated<ContactItem>>(`/contacts?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<ContactItem>>(`/contacts/${id}`)
    return res.data
  },

  create: async (data: ContactFormData) => {
    const res = await fetchClient<ApiResponse<ContactItem>>("/contacts", {
      method: "POST",
      data,
    })
    return res.data
  },

  update: async (id: string, data: ContactFormData) => {
    const res = await fetchClient<ApiResponse<ContactItem>>(`/contacts/${id}`, {
      method: "PUT",
      data,
    })
    return res.data
  },

  delete: async (id: string) => {
    await fetchClient("/contacts", {
      method: "DELETE",
      data: { id },
    })
  },

  getCategories: async () => {
    const res = await fetchClient<ApiResponse<ContactCategory[]>>("/contact/category")
    return res.data ?? []
  },

  getAccountPayableOptions: async () => {
    const res = await fetchClient<ApiResponse<AccountPayableOption[]>>("/contact/account-payable")
    return res.data ?? []
  },

  createCategory: async (data: CategoryFormData) => {
    const res = await fetchClient<ApiResponse<ContactCategory>>("/contact/category", {
      method: "POST",
      data,
    })
    return res.data
  },

  updateCategory: async (id: string, data: CategoryFormData) => {
    const res = await fetchClient<ApiResponse<ContactCategory>>(`/contact/category/${id}`, {
      method: "PUT",
      data,
    })
    return res.data
  },

  deleteCategory: async (id: string) => {
    await fetchClient("/contact/category", {
      method: "DELETE",
      data: { id },
    })
  },
}
