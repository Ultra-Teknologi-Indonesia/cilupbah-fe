import { fetchClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api.types"
import type { GenerateBinsPayload } from "@/types/pengaturan/location"

export const LocationBinService = {
  // Simpan kombinasi rak ke lokasi (butuh lokasi sudah tersimpan).
  generate: async (
    locationId: string,
    payload: GenerateBinsPayload
  ): Promise<{ generatedCount: number }> => {
    const res = await fetchClient<ApiResponse<{ generated_count: number }>>(
      `/locations/${locationId}/bins/generate`,
      { method: "POST", data: payload }
    )
    return { generatedCount: res.data?.generated_count ?? 0 }
  },
}
