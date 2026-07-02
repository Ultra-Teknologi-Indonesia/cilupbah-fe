"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { PaginationState } from "@tanstack/react-table"

// State standar halaman list: search (debounced), paginasi, dan filter —
// pengganti copy-paste useState+useEffect di tiap tab list (AUDIT-FE.md §4.2).
// Params fetch dirakit pemanggil dari debouncedSearch/page/perPage/filters
// karena bentuk key filter berbeda per API ("filter[status]" dsb).
export function useListState<F extends object>(
  emptyFilters: F,
  opts?: { perPage?: number; debounceMs?: number }
) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(opts?.perPage ?? 20)
  const [filters, setFiltersRaw] = useState<F>(emptyFilters)

  const resetPage = useCallback(() => setPage(1), [])

  const debounceMs = opts?.debounceMs ?? 300
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [search, debounceMs])

  const setFilters = useCallback((f: F) => {
    setFiltersRaw(f)
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersRaw(emptyFilters)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: page - 1, pageSize: perPage }),
    [page, perPage]
  )

  const onPaginationChange = useCallback((p: PaginationState) => {
    setPage(p.pageIndex + 1)
    setPerPage(p.pageSize)
  }, [])

  return {
    search,
    setSearch,
    debouncedSearch,
    page,
    perPage,
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
