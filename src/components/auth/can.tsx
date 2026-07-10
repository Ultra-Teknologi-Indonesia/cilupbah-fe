"use client";

import * as React from "react";

import { usePermissions } from "@/hooks/auth/use-permissions";

interface CanProps {
  /** Satu permission atau daftar. Kosong/undefined → selalu tampil. */
  permission?: string | string[];
  /** Untuk daftar: "any" (default, minimal satu) atau "all" (semua). */
  mode?: "any" | "all";
  /** Ditampilkan saat tidak diizinkan (default: tidak render apa pun). */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Render-guard hak akses. Bungkus elemen yang hanya boleh terlihat jika
 * pengguna punya izin terkait. Owner selalu lolos (via `usePermissions`).
 *
 *   <Can permission="create-produk"><Button>Tambah</Button></Can>
 *   <Can permission={["edit-pesanan", "delete-pesanan"]}>…</Can>
 */
export function Can({
  permission,
  mode = "any",
  fallback = null,
  children,
}: CanProps): React.ReactNode {
  const { can, canAny, canAll } = usePermissions();

  if (!permission) return children;

  const perms = Array.isArray(permission) ? permission : [permission];
  if (perms.length === 0) return children;

  const allowed =
    perms.length === 1 ? can(perms[0]) : mode === "all" ? canAll(perms) : canAny(perms);

  return allowed ? children : fallback;
}
