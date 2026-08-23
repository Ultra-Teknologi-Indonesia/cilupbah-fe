"use client";

import { useMemo } from "react";

import { useMe } from "@/hooks/auth/use-auth";

export interface PermissionChecks {
  isOwner: boolean;

  permissions: string[];

  isLoading: boolean;

  can: (permission: string) => boolean;

  canAny: (permissions: string[]) => boolean;

  canAll: (permissions: string[]) => boolean;

  isWarehouseRestricted: boolean;

  allowedLocationIds: string[] | null;

  canAccessWarehouse: (locationId: string | null | undefined) => boolean;
}

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

    const assignedLocationIds = (me?.locations ?? []).map((l) => l.location_id);
    const isWarehouseRestricted = !isOwner && assignedLocationIds.length > 0;
    const allowedLocationIds = isWarehouseRestricted
      ? assignedLocationIds
      : null;

    const canAccessWarehouse = (
      locationId: string | null | undefined,
    ): boolean =>
      !isWarehouseRestricted ||
      (locationId != null && assignedLocationIds.includes(locationId));

    return {
      isOwner,
      permissions,
      isLoading,
      can,
      canAny,
      canAll,
      isWarehouseRestricted,
      allowedLocationIds,
      canAccessWarehouse,
    };
  }, [me, isLoading]);
}
