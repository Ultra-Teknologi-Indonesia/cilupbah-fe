import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LocationService } from "@/services/manajemen-rak/location.service"

interface BulkUpdateBin {
  id: string
  max_qty: number
  is_stock_acknowledged: boolean
  is_large_bin: boolean
  category: string | null
}

export function useBulkUpdateBins(locationId?: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (bins: BulkUpdateBin[]) => {
      if (!locationId) throw new Error("locationId is required")
      return LocationService.bulkUpdateBins(locationId, bins)
    },
    onSuccess: () => {
      if (locationId) {
        qc.invalidateQueries({ queryKey: ["location", locationId] })
      }
    },
  })
}
