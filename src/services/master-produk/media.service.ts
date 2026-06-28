import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"

export interface UploadedMedia {
  uuid: string
  url: string
}

interface RawMedia {
  uuid: string
  url: string
}

export const MediaService = {
  upload: async (file: File): Promise<UploadedMedia> => {
    const form = new FormData()
    form.append("file", file)

    const res = await fetchClient<ApiResponse<RawMedia>>("/media/upload", {
      method: "POST",
      data: form,
    })

    return { uuid: res.data.uuid, url: res.data.url }
  },
}
