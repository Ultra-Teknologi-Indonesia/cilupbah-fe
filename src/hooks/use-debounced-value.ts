"use client"

import { useEffect, useState } from "react"

/**
 * Nilai yang "menyusul" setelah jeda ketikan. Pakai untuk state search/filter
 * yang menjadi bagian queryKey agar tidak terjadi satu fetch per ketikan:
 * input dikontrol oleh nilai asli, query membaca nilai hasil debounce.
 */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
