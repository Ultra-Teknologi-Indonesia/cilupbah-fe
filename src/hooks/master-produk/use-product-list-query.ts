"use client"

import * as React from "react"
import type { PaginationState, SortingState } from "@tanstack/react-table"

import type { SelectedCategory } from "@/types/master-produk"
import { useMasterProducts } from "./use-master-products"


const SORT_FIELD: Record<string, string> = {
  itemName: "name",
  lastModified: "updated_at",
}


export function useProductListQuery() {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [status, setStatusRaw] = React.useState<string | null>(null)
  const [brandId, setBrandIdRaw] = React.useState<string | null>(null)
  const [category, setCategoryRaw] = React.useState<SelectedCategory | null>(null)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const resetPage = React.useCallback(
    () => setPagination((p) => ({ ...p, pageIndex: 0 })),
    []
  )

  
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      resetPage()
    }, 350)
    return () => clearTimeout(t)
  }, [search, resetPage])

  const setStatus = React.useCallback(
    (v: string | null) => {
      setStatusRaw(v)
      resetPage()
    },
    [resetPage]
  )
  const setBrandId = React.useCallback(
    (v: string | null) => {
      setBrandIdRaw(v)
      resetPage()
    },
    [resetPage]
  )
  const setCategory = React.useCallback(
    (v: SelectedCategory | null) => {
      setCategoryRaw(v)
      resetPage()
    },
    [resetPage]
  )

  const reset = React.useCallback(() => {
    setSearch("")
    setDebouncedSearch("")
    setStatusRaw(null)
    setBrandIdRaw(null)
    setCategoryRaw(null)
    setSorting([])
    resetPage()
  }, [resetPage])

  const sort = sorting[0]
    ? `${sorting[0].desc ? "-" : ""}${SORT_FIELD[sorting[0].id] ?? sorting[0].id}`
    : undefined

  const result = useMasterProducts({
    search: debouncedSearch || undefined,
    status: status || undefined,
    brandId: brandId || undefined,
    categoryId: category?.id || undefined,
    sort,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const hasFilter = Boolean(
    search || status || brandId || category || sorting.length
  )

  return {
    search,
    setSearch,
    status,
    setStatus,
    brandId,
    setBrandId,
    category,
    setCategory,
    sorting,
    setSorting,
    pagination,
    setPagination,
    reset,
    hasFilter,
    result,
  }
}
