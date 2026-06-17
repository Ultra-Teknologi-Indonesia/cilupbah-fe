"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { WarehouseSettingService } from "@/services/pengaturan/warehouse-setting.service"

const settingKey = ["pengaturan", "warehouse-layout-setting"] as const

export function useWarehouseLayoutSetting() {
  return useQuery({
    queryKey: settingKey,
    queryFn: () => WarehouseSettingService.get(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSaveWarehouseLayoutSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (useWarehouseLayout: boolean) =>
      WarehouseSettingService.save(useWarehouseLayout),
    onSuccess: (data) => {
      queryClient.setQueryData(settingKey, data)
    },
  })
}
