"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

// State tab yang hidup di URL (?tab=picking dsb) — bukan useState lokal, agar
// tab bertahan saat refresh/back dan bisa dibagikan sebagai link
// (AUDIT-FE.md §5.4 & §6.8). Contoh pemakaian: halaman Pesanan (tab & sub
// status) dan Proses Pesanan (sub tab per stage).
export function useUrlTab<T extends string>(
  key: string,
  defaultValue: T,
  options?: {
    validValues?: readonly T[]
    /** Key lain yang ikut dihapus saat tab berganti (mis. "sub" saat ganti "tab"). */
    clearKeys?: readonly string[]
  }
): [T, (value: T) => void] {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { validValues, clearKeys } = options ?? {}

  const raw = searchParams.get(key)
  const value =
    raw && (!validValues || (validValues as readonly string[]).includes(raw))
      ? (raw as T)
      : defaultValue

  const setValue = useCallback(
    (next: T) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next === defaultValue) {
        params.delete(key)
      } else {
        params.set(key, next)
      }
      for (const k of clearKeys ?? []) params.delete(k)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    // clearKeys: array literal dari pemanggil — cukup dibandingkan per isi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, pathname, searchParams, key, defaultValue, JSON.stringify(clearKeys)]
  )

  return [value, setValue]
}
