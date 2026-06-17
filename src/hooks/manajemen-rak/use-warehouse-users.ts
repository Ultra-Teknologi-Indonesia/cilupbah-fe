"use client"

import { useQuery } from "@tanstack/react-query"

import { WarehouseUserService } from "@/services/manajemen-rak/warehouse-user.service"

export function useWarehouseUsers() {
  return useQuery({
    queryKey: ["manajemen-rak", "warehouse-users"],
    queryFn: () => WarehouseUserService.list(),
    staleTime: 5 * 60 * 1000,
  })
}
