"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchClient } from "@/lib/api-client"

export interface Me {
  id: string
  name: string
  email?: string | null
  roles?: Array<{ name?: string } | string> | null
}

/** User yang sedang login (GET /profile). Dipakai untuk default-pilih pelaku aksi. */
export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetchClient<{ data: Me }>("/profile")
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function meHasRole(me: Me | undefined, role?: string | string[]): boolean {
  if (!me?.roles || !role) return false
  const wanted = Array.isArray(role) ? role : [role]
  const names = me.roles.map((r) => (typeof r === "string" ? r : r?.name ?? "")).filter(Boolean)
  return names.some((n) => wanted.includes(n))
}
