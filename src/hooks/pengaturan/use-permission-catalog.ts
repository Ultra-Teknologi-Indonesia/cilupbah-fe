"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionService } from "@/services/pengaturan/permission.service";

/**
 * Ambil katalog izin bergrup (untuk render matriks Hak Akses). Katalog
 * jarang berubah, jadi di-cache lama.
 */
export function usePermissionCatalog() {
  return useQuery({
    queryKey: ["permissions", "catalog"],
    queryFn: () => PermissionService.catalog(),
    staleTime: 30 * 60 * 1000,
  });
}
