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

    const res = await fetch("/api/app/media/upload", {
      method: "POST",
      body: form,
    })

    const body: ApiResponse<RawMedia> | null = await res
      .json()
      .catch(() => null)

    if (!res.ok || !body) {
      throw body ?? { message: "Gagal mengunggah media" }
    }

    return { uuid: body.data.uuid, url: body.data.url }
  },
}
