"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { PaginationState } from "@tanstack/react-table"
import { AlertTriangleIcon, PlusIcon, SearchIcon, SearchXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useNaikkanList, useCreateNaikkan, useDeleteNaikkan } from "@/hooks/master-produk/use-naikkan"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import type { RaiseProductStore } from "@/services/master-produk/naikkan.service"
import { buildStoreColumns } from "./naikkan-store-columns"
import { NaikkanTambahDialog } from "./naikkan-tambah-dialog"

export function NaikkanStoreView() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [appliedSearch, setAppliedSearch] = React.useState("")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })

  const query = useNaikkanList({
    search: appliedSearch || undefined,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const items = query.data?.items ?? []
  const total = query.data?.meta?.total ?? 0

  const [deleteTarget, setDeleteTarget] = React.useState<RaiseProductStore | null>(null)
  const deleteMut = useDeleteNaikkan()

  const [showTambah, setShowTambah] = React.useState(false)
  const createMut = useCreateNaikkan()
  const { data: stores = [] } = useConnectedStores()

  const shopeeStores = React.useMemo(
    () => stores.filter((s) => s.channel?.code === "shopee" && s.is_active),
    [stores]
  )

  const columns = React.useMemo(
    () => buildStoreColumns((s) => setDeleteTarget(s)),
    []
  )

  const applySearch = () => {
    setAppliedSearch(search)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  return (
    <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch()
              }}
              placeholder="Cari nama toko..."
              className="h-9 w-64 border-border bg-background pl-9"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={applySearch}>
            Cari
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setShowTambah(true)}
        >
          <PlusIcon className="size-4" />
          Tambah Naikkan
        </Button>
      </div>

      <div className="px-4 py-5 sm:px-5">
        {query.isError ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertTriangleIcon className="size-8 text-destructive" />
            <p className="font-medium">Gagal memuat data</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
            >
              Coba lagi
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={items}
            isLoading={query.isLoading}
            getRowId={(s) => s.raiseproductId}
            hideToolbar
            manualPagination
            rowCount={total}
            pagination={pagination}
            onPaginationChange={setPagination}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <div className="flex flex-col items-center gap-2 py-6">
                <SearchXIcon className="size-8 text-muted-foreground" />
                <p className="font-medium">Belum ada data naikkan</p>
                <p className="text-sm text-muted-foreground">
                  Klik &ldquo;Tambah Naikkan&rdquo; untuk menambahkan toko Shopee.
                </p>
              </div>
            }
          />
        )}
      </div>

      <NaikkanTambahDialog
        open={showTambah}
        onOpenChange={setShowTambah}
        stores={shopeeStores}
        existingStoreIds={items.map((i) => i.storeId)}
        loading={createMut.isPending}
        onSubmit={(shopId) => {
          createMut.mutate(shopId, {
            onSuccess: (store) => {
              setShowTambah(false)
              router.push(`/dashboard/produk/naikkan/${store.raiseproductId}`)
            },
          })
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Data Naikkan?"
        description={`Data naikkan untuk toko "${deleteTarget?.storeName}" akan dihapus beserta seluruh produk di dalamnya.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMut.mutate(deleteTarget.raiseproductId, {
            onSuccess: () => setDeleteTarget(null),
          })
        }}
      />
    </LiquidGlass>
  )
}
