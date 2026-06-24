"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  LockIcon,
  UsersIcon,
  TruckIcon,
  ArrowLeftRightIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { useContacts, useContactCategories, useDeleteContact } from "@/hooks/kontak-pemasok/use-contacts"
import type { ContactItem, ContactListParams } from "@/types/kontak-pemasok/contact"

type TypeFilter = "all" | "SUPPLIER" | "BOTH"

const TYPE_TABS: { key: TypeFilter; label: string; icon: typeof UsersIcon }[] = [
  { key: "all", label: "Semua", icon: UsersIcon },
  { key: "SUPPLIER", label: "Pemasok", icon: TruckIcon },
  { key: "BOTH", label: "Pemasok dan Pelanggan", icon: ArrowLeftRightIcon },
]

const TYPE_LABELS: Record<string, string> = {
  SUPPLIER: "Pemasok",
  BOTH: "Pemasok dan Pelanggan",
  CUSTOMER: "Pelanggan",
}

interface FilterState {
  category_id: string
  status: string
}

const EMPTY_FILTERS: FilterState = { category_id: "", status: "" }

function TableSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 px-3 py-3">
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border-b border-border/20 px-3 py-3.5">
          <div className="flex gap-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function KontakPemasokView() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [deleteTarget, setDeleteTarget] = useState<ContactItem | null>(null)

  const resetPage = useCallback(() => setPage(1), [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      resetPage()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, resetPage])

  const handleTypeFilter = useCallback((t: TypeFilter) => {
    setTypeFilter(t)
    resetPage()
  }, [resetPage])

  const handleFilterChange = useCallback((f: FilterState) => {
    setFilters(f)
    resetPage()
  }, [resetPage])

  const params = useMemo<ContactListParams>(() => ({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    "filter[type]": typeFilter === "all" ? undefined : typeFilter,
    "filter[category_id]": filters.category_id || undefined,
    "filter[status]": filters.status || undefined,
  }), [debouncedSearch, page, perPage, typeFilter, filters])

  const { data, isLoading, isFetching } = useContacts(params)
  const { data: categories = [] } = useContactCategories()
  const deleteMut = useDeleteContact()

  const items = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const categoryOptions = useMemo(() => [
    { value: "", label: "Semua Kategori" },
    ...categories.map((c) => ({ value: c.id, label: c.code ? `${c.code} - ${c.name}` : c.name })),
  ], [categories])

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
  ]

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = [filters.category_id, filters.status].filter(Boolean).length

  function handleDelete() {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const filterTabs = (
    <div className="flex items-center gap-1">
      {TYPE_TABS.map(({ key, label, icon: Icon }) => {
        const isActive = typeFilter === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleTypeFilter(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="primary" asChild>
          <Link href="/dashboard/kontak-pemasok/tambah">
            <PlusIcon className="h-4 w-4" />
            Tambah Pemasok
          </Link>
        </Button>
      </div>

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari nama, perusahaan, email..."
          align="end"
          leading={filterTabs}
          onReset={hasActiveFilter ? () => handleFilterChange(EMPTY_FILTERS) : undefined}
          hasFilter={hasActiveFilter}
          activeCount={activeCount}
          gridCols={2}
        >
          <Combobox
            options={categoryOptions}
            value={filters.category_id}
            onChange={(v) => handleFilterChange({ ...filters, category_id: v ?? "" })}
            placeholder="Kategori"
            searchPlaceholder="Cari kategori"
            className="h-9 bg-background"
          />
          <Combobox
            options={statusOptions}
            value={filters.status}
            onChange={(v) => handleFilterChange({ ...filters, status: v ?? "" })}
            placeholder="Status"
            searchPlaceholder="Cari status"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        {isFetching && !isLoading && (
          <div className="flex justify-center py-1">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        <div className="px-4 py-3 sm:px-5">
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <TruckIcon className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">Belum ada kontak pemasok</p>
                <p className="mt-1 text-xs">Tambah pemasok baru untuk mulai mengelola kontak.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Nama
                      </th>
                      <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Email
                      </th>
                      <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Telepon
                      </th>
                      <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Kategori
                      </th>
                      <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Tipe
                      </th>
                      <th className="whitespace-nowrap px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: ContactItem) => (
                      <tr
                        key={item.id}
                        className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40"
                      >
                        <td className="whitespace-nowrap px-3 py-3 font-medium">
                          <Link
                            href={`/dashboard/kontak-pemasok/${item.id}`}
                            className="inline-flex items-center gap-1.5 hover:text-primary hover:underline"
                          >
                            {item.is_system && (
                              <LockIcon className="h-3 w-3 text-amber-500" />
                            )}
                            {item.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.email || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.phone || item.mobile || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.category
                            ? item.category.code
                              ? `${item.category.code} - ${item.category.name}`
                              : item.category.name
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] leading-tight",
                              item.type === "BOTH"
                                ? "border-purple-300 text-purple-600 dark:border-purple-500/30 dark:text-purple-400"
                                : "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400"
                            )}
                          >
                            {TYPE_LABELS[item.type] ?? item.type}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              asChild
                            >
                              <Link href={`/dashboard/kontak-pemasok/${item.id}/edit`} aria-label="Edit">
                                <PencilIcon className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            {!item.is_system && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setDeleteTarget(item)}
                                aria-label="Hapus"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2Icon className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SimplePagination
                page={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={setPage}
                perPage={meta.per_page}
                onPerPageChange={(s) => { setPerPage(s); resetPage() }}
                pageSizeOptions={[15, 30, 50]}
                total={meta.total}
                label="kontak"
              />
            </div>
          )}
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus Pemasok"
        description={`Apakah Anda yakin ingin menghapus kontak "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
