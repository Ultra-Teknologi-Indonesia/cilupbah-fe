"use client";

import * as React from "react";

import { usePermissions } from "@/hooks/auth/use-permissions";

interface CanProps {
  permission?: string | string[];

  mode?: "any" | "all";

  fallback?: React.ReactNode;
  children: React.ReactNode;
}

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
    perms.length === 1
      ? can(perms[0])
      : mode === "all"
        ? canAll(perms)
        : canAny(perms);

  return allowed ? children : fallback;
}
