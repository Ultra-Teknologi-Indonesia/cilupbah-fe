"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { UserService } from "@/services/pengaturan/user.service"
import type { UserListParams, UserFormPayload } from "@/types/pengaturan/user"

export const userKeys = {
  all: ["pengaturan", "pengguna"] as const,
  list: (params: UserListParams) => [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  roles: ["pengaturan", "roles"] as const,
}

export function useUsers(params: UserListParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => UserService.list(params),
    staleTime: 30 * 1000,
  })
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => UserService.detail(id),
    enabled: !!id,
  })
}

export function useRoles() {
  return useQuery({
    queryKey: userKeys.roles,
    queryFn: () => UserService.roles(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UserFormPayload) => UserService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserFormPayload }) =>
      UserService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => UserService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}
