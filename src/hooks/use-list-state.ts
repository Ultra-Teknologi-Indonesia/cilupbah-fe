"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { PaginationState } from "@tanstack/react-table"

// State standar halaman list: search (debounced), paginasi, dan filter —
// pengganti copy-paste useState+useEffect di tiap tab list (AUDIT-FE.md §4.2).
// Params fetch dirakit pemanggil dari debouncedSearch/page/perPage/filters
// karena bentuk key filter berbeda per API ("filter[status]" dsb).
//
// Opsi `urlSync`: bila diaktifkan, `page` dan `per_page` (dan `search`) hidup
// di URL (?page=, ?per_page=, ?q=) sehingga refresh/back mempertahankan
// halaman aktif dan link bisa dibagikan (AUDIT-FE.md §6.8). `namespace`
// dipakai untuk memberi prefix key agar beberapa list yang berbagi URL yang
// sama (mis. tab-tab di halaman Transaksi Stok) tidak saling bertabrakan.
export function useListState<F extends object>(
  emptyFilters: F,
  opts?: {
    perPage?: number
    debounceMs?: number
    urlSync?: boolean
    /** Prefix key URL agar beberapa list di halaman yang sama tidak bentrok. */
    namespace?: string
  }
) {
  const urlSync = opts?.urlSync ?? false
  const ns = opts?.namespace ? `${opts.namespace}_` : ""
  const defaultPerPage = opts?.perPage ?? 20

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pageKey = `${ns}page`
  const perPageKey = `${ns}per_page`
  const searchKey = `${ns}q`

  const readNumber = (key: string, fallback: number) => {
    if (!urlSync) return fallback
    const raw = searchParams.get(key)
    const n = raw ? Number.parseInt(raw, 10) : NaN
    return Number.isFinite(n) && n > 0 ? n : fallback
  }
  const readSearch = () => (urlSync ? searchParams.get(searchKey) ?? "" : "")

  const [search, setSearchRaw] = useState<string>(() => readSearch())
  const [debouncedSearch, setDebouncedSearch] = useState<string>(() => readSearch().trim())
  const [page, setPageRaw] = useState<number>(() => readNumber(pageKey, 1))
  const [perPage, setPerPageRaw] = useState<number>(() =>
    readNumber(perPageKey, defaultPerPage)
  )
  const [filters, setFiltersRaw] = useState<F>(emptyFilters)

  // Sinkron perubahan URL → state (mis. back/forward browser). Hanya aktif
  // saat urlSync=true agar mode legacy tetap nol overhead.
  useEffect(() => {
    if (!urlSync) return
    const nextPage = readNumber(pageKey, 1)
    const nextPerPage = readNumber(perPageKey, defaultPerPage)
    const nextSearch = readSearch()
    setPageRaw((prev) => (prev === nextPage ? prev : nextPage))
    setPerPageRaw((prev) => (prev === nextPerPage ? prev : nextPerPage))
    setSearchRaw((prev) => (prev === nextSearch ? prev : nextSearch))
    setDebouncedSearch((prev) => {
      const t = nextSearch.trim()
      return prev === t ? prev : t
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSync, searchParams])

  const writeUrl = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      if (!urlSync) return
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          // defaults dihapus dari URL agar tetap bersih
          (key === pageKey && value === 1) ||
          (key === perPageKey && value === defaultPerPage)
        ) {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [urlSync, searchParams, router, pathname, pageKey, perPageKey, defaultPerPage]
  )

  const setPage = useCallback(
    (p: number) => {
      setPageRaw(p)
      writeUrl({ [pageKey]: p })
    },
    [writeUrl, pageKey]
  )

  const setPerPage = useCallback(
    (pp: number) => {
      setPerPageRaw(pp)
      writeUrl({ [perPageKey]: pp })
    },
    [writeUrl, perPageKey]
  )

  const setSearch = useCallback(
    (s: string) => {
      setSearchRaw(s)
    },
    []
  )

  const resetPage = useCallback(() => {
    setPageRaw(1)
    writeUrl({ [pageKey]: 1 })
  }, [writeUrl, pageKey])

  const debounceMs = opts?.debounceMs ?? 300
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = search.trim()
      setDebouncedSearch((prev) => (prev === trimmed ? prev : trimmed))
      setPageRaw(1)
      if (urlSync) {
        writeUrl({ [searchKey]: trimmed || null, [pageKey]: 1 })
      }
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [search, debounceMs, urlSync, writeUrl, searchKey, pageKey])

  const setFilters = useCallback(
    (f: F) => {
      setFiltersRaw(f)
      setPageRaw(1)
      if (urlSync) writeUrl({ [pageKey]: 1 })
    },
    [urlSync, writeUrl, pageKey]
  )

  const resetFilters = useCallback(
    () => {
      setFiltersRaw(emptyFilters)
      setPageRaw(1)
      if (urlSync) writeUrl({ [pageKey]: 1 })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [urlSync, writeUrl, pageKey]
  )

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: page - 1, pageSize: perPage }),
    [page, perPage]
  )

  const onPaginationChange = useCallback(
    (p: PaginationState) => {
      const nextPage = p.pageIndex + 1
      const nextPerPage = p.pageSize
      setPageRaw(nextPage)
      setPerPageRaw(nextPerPage)
      writeUrl({ [pageKey]: nextPage, [perPageKey]: nextPerPage })
    },
    [writeUrl, pageKey, perPageKey]
  )

  return {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    perPage,
    setPerPage,
    resetPage,
    filters,
    setFilters,
    resetFilters,
    hasActiveFilter,
    activeFilterCount,
    pagination,
    onPaginationChange,
  }
}
