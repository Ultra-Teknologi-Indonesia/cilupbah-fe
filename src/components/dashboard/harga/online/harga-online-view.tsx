"use client"

import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { ImageIcon, PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import { useOnlinePrices, useUpdateOnlinePrices } from "@/hooks/harga/use-prices"
import type { OnlinePriceRow, ChannelHeader } from "@/types/harga/price"
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

function ProductCell({ row }: { row: OnlinePriceRow }) {
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

export function HargaOnlineView() {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [channelShopId, setChannelShopId] = React.useState<string | null>(null)
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

  const { data, isLoading } = useOnlinePrices({
    search: search || undefined,
    channel_shop_id: channelShopId || undefined,
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  })

  const items = data?.items ?? []
  const channels: ChannelHeader[] = data?.channels ?? []
  const total = data?.meta?.total ?? 0

  const updateMutation = useUpdateOnlinePrices()

  const channelOptions = React.useMemo(
    () =>
      channels.map((c) => ({
        value: c.channel_shop_id,
        label: c.store_name,
        hint: c.channel_name,
      })),
    [channels]
  )

  const hasFilter = !!search || !!channelShopId
  const onReset = () => {
    setSearchInput("")
    setSearch("")
    setChannelShopId(null)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const handleEdit = (row: OnlinePriceRow, channel: ChannelHeader, price: number) => {
    setEditData({
      variantId: row.variantId,
      productName: row.productName,
      sku: row.sku,
      targetId: channel.channel_shop_id,
      targetName: `${channel.store_name} (${channel.channel_name})`,
      currentPrice: price,
    })
    setEditOpen(true)
  }

  const handleSave = (variantId: string, targetId: string, price: number) => {
    updateMutation.mutate(
      [{ variant_id: variantId, channel_shop_id: targetId, price }],
      { onSuccess: () => setEditOpen(false) }
    )
  }

  const fixedColumns: ColumnDef<OnlinePriceRow>[] = [
    {
      id: "product",
      header: "Produk",
      cell: ({ row }) => <ProductCell row={row.original} />,
      size: 280,
    },
    {
      accessorKey: "buyPrice",
      header: () => <div className="text-right">HPP</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums text-sm text-muted-foreground">
          {formatIDR(row.original.buyPrice)}
        </div>
      ),
      size: 130,
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

  const channelColumns: ColumnDef<OnlinePriceRow>[] = channels.map((ch) => ({
    id: `ch-${ch.channel_shop_id}`,
    header: () => (
      <div className="text-right">
        <div className="truncate text-xs font-medium">{ch.store_name}</div>
        <div className="truncate text-[10px] text-muted-foreground">{ch.channel_name}</div>
      </div>
    ),
    cell: ({ row }: { row: { original: OnlinePriceRow } }) => {
      const p = row.original.prices.find((pr) => pr.channel_shop_id === ch.channel_shop_id)
      if (!p) {
        return <div className="text-right text-sm text-muted-foreground/50">—</div>
      }
      return (
        <div className="flex items-center justify-end gap-1">
          <span className="tabular-nums text-sm">{formatIDR(p.price)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-foreground"
            onClick={() => handleEdit(row.original, ch, p.price)}
          >
            <PencilIcon className="size-3" />
          </Button>
        </div>
      )
    },
    size: 160,
  }))

  const columns = [...fixedColumns, ...channelColumns]

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
          activeCount={[channelShopId !== null].filter(Boolean).length}
        >
          <Combobox
            options={channelOptions}
            value={channelShopId}
            onChange={(v) => {
              setChannelShopId(v)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            placeholder="Pilih channel"
            searchPlaceholder="Cari channel"
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
              <span className="text-muted-foreground">Belum ada data harga online</span>
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
