"use client"

import { useMutation } from "@tanstack/react-query"

import { AuthService } from "@/services/auth/auth.service"
import { clearLoginSession } from "@/app/actions/auth.actions"
import type { LoginRequest } from "@/types/auth/auth.types"

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
