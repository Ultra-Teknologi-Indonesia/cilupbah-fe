import { fetchClient, fetchBlob } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type {
  ImportValidateResult,
  ImportSaveResult,
  ImportValidRow,
} from "@/types/kontak-pemasok/import"

const BASE = "/contacts/import"

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

export const ContactImportService = {
  downloadTemplate: () =>
    fetchBlob(`${BASE}/template`, "template-import-kontak.xlsx", XLSX_MIME),

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
