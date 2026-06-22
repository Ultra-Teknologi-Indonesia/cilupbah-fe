"use client"

import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { ImageIcon, PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import { useOfflinePrices, useUpdateOfflinePrices } from "@/hooks/harga/use-prices"
import type { OfflinePriceRow, LocationHeader } from "@/types/harga/price"
import { HargaTabBar } from "../harga-tab-bar"
import { FilterToolbar } from "../../master-produk/filter-toolbar"
import { PriceEditModal, type PriceEditData } from "../price-edit-modal"

const formatIDR = (value: number | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value)

function ProductCell({ row }: { row: OfflinePriceRow }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
        {row.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.thumbnail} alt={row.productName} className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium">{row.productName}</div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-mono">{row.sku}</span>
          {row.variationValues.length > 0 && (
            <>
              <span className="text-border">·</span>
              <span>{row.variationValues.join(" / ")}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function HargaOfflineView() {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [locationId, setLocationId] = React.useState<string | null>(null)
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [editData, setEditData] = React.useState<PriceEditData | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading } = useOfflinePrices({
    search: search || undefined,
    location_id: locationId || undefined,
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  })

  const items = data?.items ?? []
  const locations: LocationHeader[] = data?.locations ?? []
  const total = data?.meta?.total ?? 0

  const updateMutation = useUpdateOfflinePrices()

  const locationOptions = React.useMemo(
    () =>
      locations.map((l) => ({
        value: l.location_id,
        label: l.location_name,
        hint: l.is_pos_outlet ? "POS" : undefined,
      })),
    [locations]
  )

  const hasFilter = !!search || !!locationId
  const onReset = () => {
    setSearchInput("")
    setSearch("")
    setLocationId(null)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const handleEdit = (row: OfflinePriceRow, loc: LocationHeader, price: number) => {
    setEditData({
      variantId: row.variantId,
      productName: row.productName,
      sku: row.sku,
      targetId: loc.location_id,
      targetName: loc.location_name,
      currentPrice: price,
    })
    setEditOpen(true)
  }

  const handleSave = (variantId: string, targetId: string, price: number) => {
    updateMutation.mutate(
      [{ variant_id: variantId, location_id: targetId, price }],
      { onSuccess: () => setEditOpen(false) }
    )
  }

  const fixedColumns: ColumnDef<OfflinePriceRow>[] = [
    {
      id: "product",
      header: "Produk",
      cell: ({ row }) => <ProductCell row={row.original} />,
      size: 280,
    },
    {
      accessorKey: "sellPrice",
      header: () => <div className="text-right">Harga Default</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums text-sm font-medium">
          {formatIDR(row.original.sellPrice)}
        </div>
      ),
      size: 140,
    },
  ]

  const locationColumns: ColumnDef<OfflinePriceRow>[] = locations.map((loc) => ({
    id: `loc-${loc.location_id}`,
    header: () => (
      <div className="text-right">
        <div className="truncate text-xs font-medium">{loc.location_name}</div>
        {loc.is_pos_outlet && (
          <div className="text-[10px] text-muted-foreground">POS</div>
        )}
      </div>
    ),
    cell: ({ row }: { row: { original: OfflinePriceRow } }) => {
      const lp = row.original.priceByLocation.find((p) => p.location_id === loc.location_id)
      if (!lp) {
        return <div className="text-right text-sm text-muted-foreground/50">—</div>
      }
      return (
        <div className="flex items-center justify-end gap-1">
          <span className="tabular-nums text-sm">{formatIDR(lp.price)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-foreground"
            onClick={() => handleEdit(row.original, loc, lp.price)}
          >
            <PencilIcon className="size-3" />
          </Button>
        </div>
      )
    },
    size: 160,
  }))

  const columns = [...fixedColumns, ...locationColumns]

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 pt-3 sm:px-5">
          <div className="overflow-x-auto pb-2">
            <HargaTabBar />
          </div>
          <div className="flex items-center gap-3 pb-2">
            <span className="text-sm text-muted-foreground">
              Total{" "}
              <span className="font-medium text-foreground tabular-nums">{total}</span>
            </span>
          </div>
        </div>

        <FilterToolbar
          search={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Cari produk / SKU…"
          onReset={hasFilter ? onReset : undefined}
          hasFilter={hasFilter}
          activeCount={[locationId !== null].filter(Boolean).length}
        >
          <Combobox
            options={locationOptions}
            value={locationId}
            onChange={(v) => {
              setLocationId(v)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            placeholder="Pilih lokasi"
            searchPlaceholder="Cari lokasi"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        <div className="px-5 py-5 sm:px-6">
          <DataTable
            columns={columns}
            data={items}
            getRowId={(r) => r.variantId}
            isLoading={isLoading}
            hideToolbar
            manualPagination
            rowCount={total}
            pagination={pagination}
            onPaginationChange={setPagination}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <span className="text-muted-foreground">Belum ada data harga offline</span>
            }
          />
        </div>
      </LiquidGlass>

      <PriceEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        data={editData}
        isPending={updateMutation.isPending}
        onSave={handleSave}
      />
    </div>
  )
}
