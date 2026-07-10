"use client";

import { useMemo } from "react";

import { useMe } from "@/hooks/auth/use-auth";

export interface PermissionChecks {
  /** Role `owner` → akses penuh (short-circuit semua pengecekan). */
  isOwner: boolean;
  /** Daftar hak akses efektif (role + override langsung) dari profil. */
  permissions: string[];
  /** Profil masih dimuat — pengecekan default menolak (deny-by-default). */
  isLoading: boolean;
  /** true bila punya permission tersebut (atau owner). */
  can: (permission: string) => boolean;
  /** true bila punya minimal satu dari daftar (atau owner). */
  canAny: (permissions: string[]) => boolean;
  /** true bila punya semua permission di daftar (atau owner). */
  canAll: (permissions: string[]) => boolean;
}

/**
 * Sumber tunggal pengecekan hak akses di FE. Membaca profil dari `useMe()`
 * (cache react-query `["me"]`) sehinga selalu sinkron dengan sesi aktif.
 *
 * Contoh:
 *   const { can } = usePermissions();
 *   if (can("create-produk")) { ... }
 */
export function usePermissions(): PermissionChecks {
  const { data: me, isLoading } = useMe();

  return useMemo<PermissionChecks>(() => {
    const isOwner = (me?.roles ?? []).includes("owner");
    const permissions = me?.permissions ?? [];
    const granted = new Set(permissions);

    const can = (permission: string): boolean =>
      isOwner || granted.has(permission);

    const canAny = (list: string[]): boolean =>
      isOwner || list.some((p) => granted.has(p));

    const canAll = (list: string[]): boolean =>
      isOwner || list.every((p) => granted.has(p));

    return { isOwner, permissions, isLoading, can, canAny, canAll };
  }, [me, isLoading]);
}
