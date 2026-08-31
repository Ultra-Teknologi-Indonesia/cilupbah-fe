"use client";

import * as React from "react";

import { usePermissions } from "@/hooks/auth/use-permissions";
import type { PermissionRequirement } from "@/lib/auth/permissions";
import {
  dashboardGroups,
  settingsRoutes,
  filterNavGroups,
  filterSettingsRoutes,
} from "./nav-data";

export function useVisibleNav() {
  const { canAny, canAll } = usePermissions();

  const has = React.useCallback(
    (perm?: PermissionRequirement) => {
      if (!perm) return true;
      if (Array.isArray(perm)) return canAny(perm);
      if (typeof perm === "object") return canAll(perm.all);
      return canAny([perm]);
    },
    [canAll, canAny],
  );

  const groups = React.useMemo(
    () => filterNavGroups(dashboardGroups, has),
    [has],
  );
  const settings = React.useMemo(
    () => filterSettingsRoutes(settingsRoutes, has),
    [has],
  );

  return { groups, settings };
}
