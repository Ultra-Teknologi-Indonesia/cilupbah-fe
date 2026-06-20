"use client"

import * as React from "react"
import type { PaginationState } from "@tanstack/react-table"
import { AlertTriangleIcon, RefreshCwIcon, SearchXIcon } from "lucide-react"

import { format, parseISO } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { DatePicker } from "@/components/ui/date-picker"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import { useDownloadTransactions } from "@/hooks/master-produk/use-download"
import type {
  DownloadState,
  DownloadTransaction,
} from "@/services/master-produk/download.service"
import { TransactionDetailSheet } from "./transaction-detail-sheet"
import { buildProgressColumns } from "./progress-columns"

const STATES: { value: "" | DownloadState; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "downloading", label: "Sedang Berjalan" },
  { value: "done", label: "Selesai" },
  { value: "failed", label: "Gagal" },
]

export function ProgressTab({
  tabBar,
  actionButton,
}: {
  tabBar?: React.ReactNode
  actionButton?: React.ReactNode
}) {
  const { data: stores = [] } = useConnectedStores()
  const storeOptions = React.useMemo(
    () =>
      stores
        .filter((s) => s.is_active)
        .map((s) => ({ value: s.shop_id, label: s.shop_name, hint: s.channel?.name ?? undefined })),
    [stores]
  )

  // Filter draft → applied.
  const [dShop, setDShop] = React.useState<string | null>(null)
  const [dState, setDState] = React.useState<"" | DownloadState>("")
  const [dFrom, setDFrom] = React.useState("")
  const [dTo, setDTo] = React.useState("")
  const [applied, setApplied] = React.useState<{
    shop: string | null
    state: "" | DownloadState
    from: string
    to: string
  }>({ shop: null, state: "", from: "", to: "" })

  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 25 })
  const resetPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }))

  const [openTrx, setOpenTrx] = React.useState<DownloadTransaction | null>(null)

  const query = useDownloadTransactions({
    shopId: applied.shop || undefined,
    state: applied.state || undefined,
    dateFrom: applied.from || undefined,
    dateTo: applied.to || undefined,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const items = query.data?.items ?? []
  const total = query.data?.meta?.total ?? 0
  const columns = React.useMemo(() => buildProgressColumns(setOpenTrx), [])

  const apply = () => {
    setApplied({ shop: dShop, state: dState, from: dFrom, to: dTo })
    resetPage()
  }
  const reset = () => {
    setDShop(null)
    setDState("")
    setDFrom("")
    setDTo("")
    setApplied({ shop: null, state: "", from: "", to: "" })
    resetPage()
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      {/* Panel filter */}
      <aside className="lg:w-64 lg:shrink-0">
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/40 p-4 dark:bg-white/[0.06]">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium">Filter</span>
            <button type="button" onClick={reset} className="text-sm font-medium text-destructive hover:underline">
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <Combobox
              options={storeOptions}
              value={dShop}
              onChange={setDShop}
              placeholder="Pilih toko"
              searchPlaceholder="Cari toko"
              className="h-9"
            />

            <div>
              <div className="mb-1.5 text-sm font-medium">Status Download</div>
              <div className="flex flex-col gap-1">
                {STATES.map((s) => (
                  <button
                    key={s.value || "all"}
                    type="button"
                    onClick={() => setDState(s.value)}
                    className="flex items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "grid size-4 place-items-center rounded-full border",
                        dState === s.value ? "border-primary" : "border-border"
                      )}
                    >
                      {dState === s.value && <span className="size-2 rounded-full bg-primary" />}
                    </span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-sm font-medium">Tanggal Download</div>
              <div className="flex flex-col gap-2">
                <DatePicker
                  value={dFrom ? parseISO(dFrom) : undefined}
                  onChange={(d) => setDFrom(d ? format(d, "yyyy-MM-dd") : "")}
                  placeholder="Dari tanggal"
                />
                <DatePicker
                  value={dTo ? parseISO(dTo) : undefined}
                  onChange={(d) => setDTo(d ? format(d, "yyyy-MM-dd") : "")}
                  placeholder="Sampai tanggal"
                />
              </div>
            </div>

            <Button variant="primary" className="mt-1 w-full" onClick={apply}>
              Terapkan
            </Button>
          </div>
        </LiquidGlass>
      </aside>

      {/* Konten */}
      <div className="min-w-0 flex-1">
        <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 pt-3 sm:px-5">
            <div className="overflow-x-auto">{tabBar}</div>
            <div className="flex items-center gap-3 pb-2">
              {actionButton}
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
                title="Muat ulang"
              >
                <RefreshCwIcon className={cn("size-4", query.isFetching && "animate-spin motion-reduce:animate-none")} />
                Refresh
              </Button>
              <span className="text-sm text-muted-foreground">
                Total <span className="font-medium text-foreground tabular-nums">{total}</span>
              </span>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-5">
            {query.isError ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertTriangleIcon className="size-8 text-destructive" />
                <p className="font-medium">Gagal memuat transaksi</p>
                <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
                  Coba lagi
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={items}
                isLoading={query.isLoading}
                getRowId={(t) => t.trxId}
                hideToolbar
                manualPagination
                rowCount={total}
                pagination={pagination}
                onPaginationChange={setPagination}
                tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
                emptyState={
                  <div className="flex flex-col items-center gap-2 py-6">
                    <SearchXIcon className="size-8 text-muted-foreground" />
                    <p className="font-medium">Belum ada transaksi</p>
                    <p className="text-sm text-muted-foreground">Mulai dari Tambah Baru → Download Massal.</p>
                  </div>
                }
              />
            )}
          </div>
        </LiquidGlass>
      </div>

      <TransactionDetailSheet
        trx={openTrx}
        open={!!openTrx}
        onOpenChange={(o) => !o && setOpenTrx(null)}
      />
    </div>
  )
}
