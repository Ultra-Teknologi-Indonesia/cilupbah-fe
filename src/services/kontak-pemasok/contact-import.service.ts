import axios from "axios"
import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type {
  ImportValidateResult,
  ImportSaveResult,
  ImportValidRow,
} from "@/types/kontak-pemasok/import"

const BASE = "/contacts/import"

export const ContactImportService = {
  downloadTemplate: async () => {
    const res = await axios.get(`/api/app${BASE}/template`, {
      responseType: "blob",
    })
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template-import-kontak.xlsx"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
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
