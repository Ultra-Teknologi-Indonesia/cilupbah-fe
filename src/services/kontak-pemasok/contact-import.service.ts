import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type {
  ImportValidateResult,
  ImportSaveResult,
  ImportValidRow,
} from "@/types/kontak-pemasok/import"

const BASE = "/contacts/import"

export const ContactImportService = {
  downloadTemplate: () => {
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : ""
    window.open(`${baseUrl}/api/app${BASE}/template`, "_blank")
  },

  validate: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetchClient<ApiResponse<ImportValidateResult>>(
      `${BASE}/validate`,
      {
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    return res.data
  },

  save: async (rows: ImportValidRow[]) => {
    const res = await fetchClient<ApiResponse<ImportSaveResult>>(
      `${BASE}/save`,
      {
        method: "POST",
        data: { rows },
      }
    )
    return res.data
  },
}
