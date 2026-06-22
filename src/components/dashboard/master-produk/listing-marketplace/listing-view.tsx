"use client"

import * as React from "react"
import type { PaginationState } from "@tanstack/react-table"
import {
  AlertTriangleIcon,
  Loader2Icon,
  SearchXIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import {
  useBulkUnlinkListing,
  useChannelProducts,
  useDownloadChannel,
  useListingMutations,
  useUnlinkListing,
  type UnlinkInput,
} from "@/hooks/master-produk/use-channel-products"
import {
  channelListingRowId,
  type ChannelListing,
} from "@/services/master-produk/channel-product.service"
import { FilterToolbar } from "../filter-toolbar"
import { buildChannelListingColumns } from "./listing-columns"

export function ListingMarketplaceView() {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [shopId, setShopId] = React.useState<string | null>(null)
  const [minInput, setMinInput] = React.useState("")
  const [maxInput, setMaxInput] = React.useState("")
  const [priceRange, setPriceRange] = React.useState<{ min?: number; max?: number }>({})
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())

  const resetPage = React.useCallback(() => setPagination((p) => ({ ...p, pageIndex: 0 })), [])

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      resetPage()
    }, 350)
    return () => clearTimeout(t)
  }, [search, resetPage])

  const { data: stores = [] } = useConnectedStores()
  const storeOptions = React.useMemo(
    () =>
      stores
        .filter((s) => s.is_active)
        .map((s) => ({ value: s.shop_id, label: s.shop_name, hint: s.channel?.name ?? undefined })),
    [stores]
  )

  const query = useChannelProducts({
    search: debouncedSearch || undefined,
    shopId: shopId || undefined,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const parsePrice = (v: string) => {
    const n = Number(v.replace(/[^\d]/g, ""))
    return v.trim() && Number.isFinite(n) ? n : undefined
  }

  const applyPrice = () => {
    setPriceRange({ min: parsePrice(minInput), max: parsePrice(maxInput) })
    resetPage()
  }

  const items = query.data?.items ?? []
  const total = query.data?.meta?.total ?? 0

  const onToggle = React.useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const download = useDownloadChannel()
  const unlink = useUnlinkListing()
  const bulkUnlink = useBulkUnlinkListing()

  const [busyIds, setBusyIds] = React.useState<Set<string>>(new Set())
  const [unlinkTarget, setUnlinkTarget] = React.useState<ChannelListing | null>(null)
  const [bulkTarget, setBulkTarget] = React.useState<{ rows: ChannelListing[]; reset: () => void } | null>(null)

  const setBusy = React.useCallback((id: string, on: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const onDownload = React.useCallback(
    (l: ChannelListing) => {
      if (!l.shopId || !l.channelCode) return
      const id = channelListingRowId(l)
      setBusy(id, true)
      download.mutate(
        { channel: l.channelCode, shopId: l.shopId },
        { onSettled: () => setBusy(id, false) }
      )
    },
    [download, setBusy]
  )

  const onUnlink = React.useCallback((l: ChannelListing) => setUnlinkTarget(l), [])

  const { activate, deactivate, sync } = useListingMutations()
  const runAction = React.useCallback(
    (
      mutate: (vars: UnlinkInput, opts?: { onSettled?: () => void }) => void,
      l: ChannelListing
    ) => {
      if (!l.shopId || !l.channelCode || !l.channelGroupId) return
      const id = channelListingRowId(l)
      setBusy(id, true)
      mutate(
        { channel: l.channelCode, externalProductId: l.channelGroupId, shopId: l.shopId },
        { onSettled: () => setBusy(id, false) }
      )
    },
    [setBusy]
  )
  const onActivate = React.useCallback((l: ChannelListing) => runAction(activate.mutate, l), [runAction, activate.mutate])
  const onDeactivate = React.useCallback((l: ChannelListing) => runAction(deactivate.mutate, l), [runAction, deactivate.mutate])
  const onSync = React.useCallback((l: ChannelListing) => runAction(sync.mutate, l), [runAction, sync.mutate])

  const confirmUnlink = () => {
    const l = unlinkTarget
    if (!l || !l.shopId || !l.channelCode || !l.channelGroupId) return
    const id = channelListingRowId(l)
    setBusy(id, true)
    unlink.mutate(
      { channel: l.channelCode, externalProductId: l.channelGroupId, shopId: l.shopId },
      { onSettled: () => setBusy(id, false) }
    )
    setUnlinkTarget(null)
  }

  const confirmBulkUnlink = () => {
    if (!bulkTarget) return
    const items = bulkTarget.rows
      .filter((l) => l.shopId && l.channelCode && l.channelGroupId)
      .map((l) => ({ channel: l.channelCode!, externalProductId: l.channelGroupId!, shopId: l.shopId! }))
    if (items.length > 0) {
      bulkUnlink.mutate(items, { onSuccess: () => bulkTarget.reset() })
    }
    setBulkTarget(null)
  }

  const columns = React.useMemo(
    () =>
      buildChannelListingColumns({
        expanded,
        onToggle,
        onDownload,
        onUnlink,
        onActivate,
        onDeactivate,
        onSync,
        busyIds,
      }),
    [expanded, onToggle, onDownload, onUnlink, onActivate, onDeactivate, onSync, busyIds]
  )

  const setStore = (v: string | null) => {
    setShopId(v)
    resetPage()
  }

  const hasFilter = Boolean(
    search || shopId || priceRange.min != null || priceRange.max != null
  )
  const reset = () => {
    setSearch("")
    setDebouncedSearch("")
    setShopId(null)
    setMinInput("")
    setMaxInput("")
    setPriceRange({})
    resetPage()
  }

  return (
    <>
      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-base font-medium">Produk Channel</h2>
            <p className="text-sm text-muted-foreground">
              {query.isLoading ? "Memuat…" : `${total} listing`}
            </p>
          </div>
        </div>

        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari nama / SKU…"
          onReset={hasFilter ? reset : undefined}
          hasFilter={hasFilter}
          activeCount={(shopId ? 1 : 0) + (priceRange.min != null || priceRange.max != null ? 1 : 0)}
        >
          <Combobox
            options={storeOptions}
            value={shopId}
            onChange={setStore}
            placeholder="Semua toko"
            searchPlaceholder="Cari toko"
            className="h-9 bg-background"
          />
          <div className="flex items-center gap-1.5">
            <Input
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
              onBlur={applyPrice}
              inputMode="numeric"
              placeholder="Harga min"
              className="h-9 w-24 rounded-full bg-background"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
              onBlur={applyPrice}
              inputMode="numeric"
              placeholder="Harga max"
              className="h-9 w-24 rounded-full bg-background"
            />
          </div>
        </FilterToolbar>

        <div className="px-5 py-5 sm:px-6">
          {query.isError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertTriangleIcon className="size-8 text-destructive" />
              <div>
                <p className="font-medium">Gagal memuat listing</p>
                <p className="text-sm text-muted-foreground">Periksa koneksi atau coba lagi.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
                Coba lagi
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              isLoading={query.isLoading}
              getRowId={(l) => channelListingRowId(l)}
              hideToolbar
              manualPagination
              rowCount={total}
              pagination={pagination}
              onPaginationChange={setPagination}
              enableRowSelection
              bulkActions={(selected, table) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkTarget({ rows: selected, reset: () => table.resetRowSelection() })}
                >
                  <Trash2Icon className="size-4" />
                  Putuskan koneksi
                </Button>
              )}
              tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
              emptyState={
                <div className="flex flex-col items-center gap-2 py-6">
                  <SearchXIcon className="size-8 text-muted-foreground" />
                  <p className="font-medium">Tidak ada listing channel</p>
                  <p className="text-sm text-muted-foreground">Coba ubah pencarian atau filter toko.</p>
                </div>
              }
            />
          )}
        </div>
      </LiquidGlass>

      <Dialog open={!!unlinkTarget} onOpenChange={(o) => !o && setUnlinkTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Putuskan koneksi?</DialogTitle>
            <DialogDescription>
              Listing <span className="font-medium text-foreground">{unlinkTarget?.itemGroupName}</span> akan
              diputus dari <span className="font-medium text-foreground">{unlinkTarget?.storeName}</span>. Produk
              master tidak terhapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmUnlink}>
              Putuskan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!bulkTarget}
        onOpenChange={(o) => {
          if (!o && !bulkUnlink.isPending) setBulkTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Putuskan {bulkTarget?.rows.length ?? 0} koneksi?</DialogTitle>
            <DialogDescription>
              Listing terpilih akan diputus dari channel masing-masing. Produk master tidak terhapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={bulkUnlink.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmBulkUnlink} disabled={bulkUnlink.isPending}>
              {bulkUnlink.isPending && <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />}
              Putuskan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
