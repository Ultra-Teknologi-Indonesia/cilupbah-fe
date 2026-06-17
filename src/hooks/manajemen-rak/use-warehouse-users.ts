"use client"

import { useQuery } from "@tanstack/react-query"

import { WarehouseUserService } from "@/services/pengaturan/warehouse-user.service"

export function useWarehouseUsers(search?: string) {
  return useQuery({
    queryKey: ["pengaturan", "warehouse-users", search ?? ""],
    queryFn: () => WarehouseUserService.list(search),
    staleTime: 5 * 60 * 1000,
  })
}
