"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionService } from "@/services/pengaturan/permission.service";

export function usePermissionCatalog() {
  return useQuery({
    queryKey: ["permissions", "catalog"],
    queryFn: () => PermissionService.catalog(),
    staleTime: 30 * 60 * 1000,
  });
}
