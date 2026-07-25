"use client";

import * as React from "react";

import { usePermissions } from "@/hooks/auth/use-permissions";
import {
  dashboardGroups,
  settingsRoutes,
  filterNavGroups,
  filterSettingsRoutes,
} from "./nav-data";

export function useVisibleNav() {
  const { canAny, isOwner, permissions } = usePermissions();

  const has = React.useCallback(
    (perm?: string | string[]) =>
      !perm || canAny(Array.isArray(perm) ? perm : [perm]),
    [canAny],
  );

  const groups = React.useMemo(
    () => filterNavGroups(dashboardGroups, has),
    [has, isOwner, permissions],
  );
  const settings = React.useMemo(
    () => filterSettingsRoutes(settingsRoutes, has),
    [has, isOwner, permissions],
  );

  return { groups, settings };
}
