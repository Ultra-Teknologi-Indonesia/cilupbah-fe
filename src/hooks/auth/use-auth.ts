"use client"

import { useMutation, useQuery } from "@tanstack/react-query"

import { AuthService } from "@/services/auth/auth.service"
import { clearLoginSession } from "@/app/actions/auth.actions"
import type { LoginRequest } from "@/types/auth/auth.types"

// User yang sedang login. Dipakai untuk auto-isi field "oleh" + tombol "Saya sendiri".
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => AuthService.profile(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

// Login: hanya membungkus panggilan service. Side effect UI (set session cookie,
// redirect, toast) tetap di komponen lewat opsi per-`mutate` agar perilaku persis.
export function useLogin() {
  return useMutation({
    mutationFn: (values: LoginRequest) => AuthService.login(values),
  })
}

// Logout: panggil service (best-effort), bersihkan session cookie, lalu
// hard-redirect ke halaman login. Perilaku identik dengan handler lama.
export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      try {
        await AuthService.logout()
      } catch {}
      await clearLoginSession()
      window.location.href = "/login?logout=success"
    },
  })
}
