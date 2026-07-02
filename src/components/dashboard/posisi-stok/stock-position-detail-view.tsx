"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import {
  ArrowLeftIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PackageIcon,
  MapPinIcon,
  BoxIcon,
} from "lucide-react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination, TABLE_PAGE_SIZES } from "@/components/ui/simple-pagination"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageTitle } from "@/components/dashboard/page-title"
import { FilterToolbar } from "@/components/dashboard/shared/filter-toolbar"
import {
  useStockItem,
  useStockMovements,
  useItemStock,
  useMovementFilters,
} from "@/hooks/persediaan/use-stock-position"
import type { StockMovement, BinInventory } from "@/types/persediaan/stock"
import { formatCurrency } from "@/lib/format"

const CATEGORY_COLOR: Record<string, string> = {
  BILL: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20",
  ADJUSTMENT: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  PURCHASE_RETURN: "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
  SALES_RETURN: "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-500/10 dark:border-teal-500/20",
  INVOICE: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20",
  ORDER: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20",
  ORDER_CANCEL: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
  RESERVE: "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20",
  TRANSFER: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  REVALUATION: "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20",
}

const ALL_VALUE = "__all__"

function SourceBadge({ category, label }: { category: string; label: string }) {
  const color = CATEGORY_COLOR[category] ?? "text-muted-foreground bg-muted border-border"
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium", color)}>
      {label}
    </Badge>
  )
}

function QtyCell({ qty }: { qty: number }) {
  const isPositive = qty > 0
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 font-mono text-sm font-semibold tabular-nums",
      isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
    )}>
      {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
      {isPositive ? "+" : ""}{qty}
    </span>
  )
}


function StockSummaryCards({ onHand, onOrder, reserved, available, avgCost }: {
  onHand: number
  onOrder: number
  reserved: number
  available: number
  avgCost: number
}) {
  const cards = [
    { label: "On Hand", value: onHand, color: "" },
    { label: "On Order", value: onOrder, color: "" },
    { label: "Reserved", value: reserved, color: "text-orange-600 dark:text-orange-400" },
    { label: "Available", value: available, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Harga Pokok", value: formatCurrency(avgCost), color: "text-muted-foreground", isText: true },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <LiquidGlass key={c.label} radius={14} intensity="subtle" className="bg-white/30 px-4 py-3 dark:bg-white/[0.04]">
          <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
          <p className={cn("mt-1 text-xl font-bold tabular-nums", c.color)}>
            {c.isText ? c.value : c.value}
          </p>
        </LiquidGlass>
      ))}
    </div>
  )
}

function MovementsSection({ itemId }: { itemId: string }) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [source, setSource] = useState("")
  const [direction, setDirection] = useState<"" | "in" | "out">("")

  const { data: filterOptions } = useMovementFilters()
  const sourceOptions = filterOptions?.data?.sources ?? []
  const directionOptions = filterOptions?.data?.directions ?? []

  const params = useMemo(() => ({
    "filter[item_id]": itemId,
    "filter[source]": source || undefined,
    "filter[direction]": direction || undefined,
    page,
    per_page: perPage,
    sort: "-transaction_date",
  }), [itemId, source, direction, page, perPage])

  const { data, isLoading } = useStockMovements(params)
  const movements = data?.data ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const activeCount = [source, direction].filter(Boolean).length
  const hasActiveFilter = activeCount > 0

  const filterBar = (
    <FilterToolbar
      hasFilter={hasActiveFilter}
      activeCount={activeCount}
      onReset={hasActiveFilter ? () => { setSource(""); setDirection(""); setPage(1) } : undefined}
      gridCols={2}
    >
      <Select
        value={source || ALL_VALUE}
        onValueChange={(v) => { setSource(v === ALL_VALUE ? "" : v); setPage(1) }}
      >
        <SelectTrigger className="h-9 w-full rounded-full border-border bg-background">
          <SelectValue placeholder="Pilih sumber" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Semua Sumber</SelectItem>
          {sourceOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={direction || ALL_VALUE}
        onValueChange={(v) => { setDirection((v === ALL_VALUE ? "" : v) as "" | "in" | "out"); setPage(1) }}
      >
        <SelectTrigger className="h-9 w-full rounded-full border-border bg-background">
          <SelectValue placeholder="Pilih mutasi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Semua Mutasi</SelectItem>
          {directionOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterToolbar>
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {filterBar}
        <div className="space-y-2 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {filterBar}
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <PackageIcon className="h-8 w-8" />
          <p className="text-sm font-medium">Belum ada kronologi stok</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {filterBar}
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/60 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Tanggal</TableHead>
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Lokasi</TableHead>
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Kode Rak</TableHead>
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">No. Transaksi</TableHead>
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Sumber</TableHead>
            <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">Qty</TableHead>
            <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">Sisa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m: StockMovement) => (
            <TableRow key={m.id} className="border-b border-border/30 transition-colors hover:bg-muted/30">
              <TableCell className="px-3 py-2.5 text-muted-foreground">
                {format(new Date(m.transaction_date), "dd MMM yyyy HH:mm", { locale: idLocale })}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                  {m.location_name}
                </span>
              </TableCell>
              <TableCell className="px-3 py-2.5">
                {m.bin_code ? (
                  <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium">{m.bin_code}</code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <span className="font-mono text-xs">{m.transaction_number}</span>
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <SourceBadge category={m.source_category} label={m.source_label} />
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right">
                <QtyCell qty={m.qty} />
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right font-mono text-sm tabular-nums">
                {m.balance}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="px-3">
        <SimplePagination
          page={meta.current_page}
          lastPage={meta.last_page}
          onPageChange={setPage}
          perPage={meta.per_page}
          onPerPageChange={(s) => { setPerPage(s); setPage(1) }}
          pageSizeOptions={TABLE_PAGE_SIZES}
          total={meta.total}
          label="mutasi"
        />
      </div>
    </div>
  )
}

function BinSection({ itemId }: { itemId: string }) {
  const { data, isLoading } = useItemStock(itemId)
  const bins: BinInventory[] = data?.data ?? []

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (bins.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <BoxIcon className="h-8 w-8" />
        <p className="text-sm font-medium">Belum ada data persediaan di rak</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-border/60 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Lokasi</TableHead>
          <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Kode Rak</TableHead>
          <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">On Hand</TableHead>
          <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">Reserved</TableHead>
          <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">Available</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bins.map((b: BinInventory) => (
          <TableRow key={b.id} className="border-b border-border/30 transition-colors hover:bg-muted/30">
            <TableCell className="px-3 py-2.5">
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                {b.location_name}
              </span>
            </TableCell>
            <TableCell className="px-3 py-2.5">
              {b.bin_code ? (
                <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium">{b.bin_code}</code>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums">
              {b.on_hand}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right tabular-nums text-orange-600 dark:text-orange-400">
              {b.reserved}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {b.available}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function StockPositionDetailView({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"kronologi" | "rak">("kronologi")

  const { data, isLoading } = useStockItem(itemId)
  const item = data?.data ?? null

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={isLoading ? "Memuat..." : (item?.item_code ?? "Detail Stok")}
        description={isLoading ? "" : (item?.item_name ?? "")}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Persediaan" },
          { label: "Posisi Stok", href: "/dashboard/posisi-stok" },
          { label: item?.item_code ?? "Detail" },
        ]}
      />

      <Button
        variant="ghost"
        size="sm"
        className="w-fit gap-1.5"
        onClick={() => router.push("/dashboard/posisi-stok")}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke Posisi Stok
      </Button>

      {/* Item Header Card */}
      {isLoading ? (
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 p-5 dark:bg-white/[0.04]">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </LiquidGlass>
      ) : item ? (
        <>
          <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 p-5 dark:bg-white/[0.04]">
            <div className="flex items-center gap-4">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.item_name ?? item.item_code}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-xl border border-border/60 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                  <PackageIcon className="h-8 w-8 text-muted-foreground/60" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold leading-tight">{item.item_name || item.item_code}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.item_code}
                </p>
                {item.variation_values.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.variation_values.map((v) => (
                      <Badge key={`${v.label}-${v.value}`} variant="secondary" className="text-xs">
                        {v.value}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </LiquidGlass>

          <StockSummaryCards
            onHand={item.total_stocks.on_hand}
            onOrder={item.total_stocks.on_order}
            reserved={item.total_stocks.reserved}
            available={item.total_stocks.available}
            avgCost={Number(item.average_cost)}
          />
        </>
      ) : (
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 p-8 dark:bg-white/[0.04]">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <PackageIcon className="h-10 w-10" />
            <p className="text-sm font-medium">Produk tidak ditemukan</p>
          </div>
        </LiquidGlass>
      )}

      {/* Tabs Content */}
      {item && (
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
          <div className="border-b border-border/60">
            <div className="flex gap-0 px-5">
              <button
                type="button"
                onClick={() => setActiveTab("kronologi")}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === "kronologi"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Kronologi Stok
                {activeTab === "kronologi" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rak")}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === "rak"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Persediaan di Rak
                {activeTab === "rak" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === "kronologi" ? (
              <MovementsSection itemId={item.item_id} />
            ) : (
              <BinSection itemId={item.item_id} />
            )}
          </div>
        </LiquidGlass>
      )}
    </div>
  )
}
