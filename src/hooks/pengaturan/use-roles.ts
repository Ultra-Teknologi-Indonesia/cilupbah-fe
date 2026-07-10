"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { RoleService } from "@/services/pengaturan/role.service";
import type { RoleFormPayload } from "@/types/pengaturan/user";

export const roleKeys = {
  all: ["pengaturan", "peran"] as const,
  list: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};

export function useRoleList() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: () => RoleService.list(),
    staleTime: 60 * 1000,
  });
}

export function useRoleDetail(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => RoleService.detail(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoleFormPayload) => RoleService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RoleFormPayload }) =>
      RoleService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RoleService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useSyncRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      RoleService.syncPermissions(id, permissions),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: roleKeys.detail(id) });
      qc.invalidateQueries({ queryKey: roleKeys.list() });
    },
  });
}
