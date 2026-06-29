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
import { SimplePagination } from "@/components/ui/simple-pagination"
import { PageTitle } from "@/components/dashboard/page-title"
import {
  useStockItem,
  useStockMovements,
  useItemStock,
} from "@/hooks/persediaan/use-stock-position"
import type { StockMovement, BinInventory } from "@/types/persediaan/stock"

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  ADJUSTMENT: { label: "Penyesuaian", color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20" },
  PUTAWAY_IN: { label: "Putaway Masuk", color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20" },
  PUTAWAY_OUT: { label: "Putaway Keluar", color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20" },
  ORDER_RESERVE: { label: "Reserve", color: "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20" },
  ORDER_PICK: { label: "Pick", color: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20" },
  ORDER_SHIP: { label: "Kirim", color: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20" },
  ORDER_RESTORE: { label: "Restore", color: "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-500/10 dark:border-teal-500/20" },
  ORDER_CANCEL: { label: "Batal", color: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20" },
  TRANSFER_OUT: { label: "Transfer Keluar", color: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20" },
  TRANSFER_IN: { label: "Transfer Masuk", color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20" },
  BILL: { label: "Faktur Masuk", color: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20" },
  INVOICE: { label: "Faktur", color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20" },
  STOCK_OPNAME: { label: "Stok Opname", color: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20" },
  REVALUATION: { label: "Revaluasi", color: "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20" },
}

function SourceBadge({ source }: { source: string }) {
  const info = SOURCE_LABELS[source] ?? { label: source, color: "text-muted-foreground bg-muted border-border" }
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium", info.color)}>
      {info.label}
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
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

  const params = useMemo(() => ({
    "filter[item_id]": itemId,
    page,
    per_page: perPage,
    sort: "-transaction_date",
  }), [itemId, page, perPage])

  const { data, isLoading } = useStockMovements(params)
  const movements = data?.data ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <PackageIcon className="h-8 w-8" />
        <p className="text-sm font-medium">Belum ada kronologi stok</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="whitespace-nowrap px-3 py-2.5">Tanggal</th>
              <th className="whitespace-nowrap px-3 py-2.5">Lokasi</th>
              <th className="whitespace-nowrap px-3 py-2.5">Kode Rak</th>
              <th className="whitespace-nowrap px-3 py-2.5">No. Transaksi</th>
              <th className="whitespace-nowrap px-3 py-2.5">Sumber</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right">Qty</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right">Sisa</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m: StockMovement) => (
              <tr key={m.id} className="border-b border-border/30 transition-colors hover:bg-muted/30">
                <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                  {format(new Date(m.transaction_date), "dd MMM yyyy HH:mm", { locale: idLocale })}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className="inline-flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                    {m.location_name}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  {m.bin_code ? (
                    <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium">{m.bin_code}</code>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className="font-mono text-xs">{m.transaction_number}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <SourceBadge source={m.source} />
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right">
                  <QtyCell qty={m.qty} />
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-sm tabular-nums">
                  {m.balance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3">
        <SimplePagination
          page={meta.current_page}
          lastPage={meta.last_page}
          onPageChange={setPage}
          perPage={meta.per_page}
          onPerPageChange={(s) => { setPerPage(s); setPage(1) }}
          pageSizeOptions={[15, 30, 50]}
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="whitespace-nowrap px-3 py-2.5">Lokasi</th>
            <th className="whitespace-nowrap px-3 py-2.5">Kode Rak</th>
            <th className="whitespace-nowrap px-3 py-2.5">Batch</th>
            <th className="whitespace-nowrap px-3 py-2.5 text-right">On Hand</th>
            <th className="whitespace-nowrap px-3 py-2.5 text-right">Reserved</th>
            <th className="whitespace-nowrap px-3 py-2.5 text-right">Available</th>
          </tr>
        </thead>
        <tbody>
          {bins.map((b: BinInventory) => (
            <tr key={b.id} className="border-b border-border/30 transition-colors hover:bg-muted/30">
              <td className="whitespace-nowrap px-3 py-2.5">
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                  {b.location_name}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2.5">
                {b.bin_code ? (
                  <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium">{b.bin_code}</code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
                {b.batch_no || "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums">
                {b.on_hand}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-orange-600 dark:text-orange-400">
                {b.reserved}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {b.available}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PosisiStokDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.itemId as string
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
