"use client";

import * as React from "react";

import { usePermissions } from "@/hooks/auth/use-permissions";
import {
  dashboardGroups,
  settingsRoutes,
  filterNavGroups,
  filterSettingsRoutes,
} from "./nav-data";

/**
 * Nav yang sudah difilter sesuai hak akses pengguna. Dipakai bersama oleh
 * rail & panel sidebar agar konsisten. Owner melihat semua (usePermissions).
 */
export function useVisibleNav() {
  const { canAny, isOwner, permissions } = usePermissions();

  const has = React.useCallback(
    (perm?: string | string[]) =>
      !perm || canAny(Array.isArray(perm) ? perm : [perm]),
    [canAny],
  );

  // isOwner/permissions ikut sebagai dependensi agar recompute saat sesi berubah.
  const groups = React.useMemo(
    () => filterNavGroups(dashboardGroups, has),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [has, isOwner, permissions],
  );
  const settings = React.useMemo(
    () => filterSettingsRoutes(settingsRoutes, has),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [has, isOwner, permissions],
  );

  return { groups, settings };
}
