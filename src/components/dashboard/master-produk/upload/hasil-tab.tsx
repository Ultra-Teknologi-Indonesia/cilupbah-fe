"use client"

import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import {
  CheckCircle2Icon,
  ExternalLinkIcon,
  ImageIcon,
  InfoIcon,
  RotateCcwIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { Checkbox } from "@/components/ui/checkbox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import {
  useBulkDeleteHistories,
  useReuploadHistory,
  useUploadHistories,
} from "@/hooks/master-produk/use-upload"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import type { HistoryRow } from "@/services/master-produk/upload.service"
import type { ChannelCode } from "@/types/channel"
import { ChannelLogo } from "@/components/dashboard/integrasi-channel/channel-logo"
import { FilterShell } from "../filter-shell"

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "success", label: "Berhasil" },
  { value: "failed", label: "Gagal" },
]

function fmtDate(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function HistoryStatus({ row }: { row: HistoryRow }) {
  if (row.success) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
        title={row.statusMessage ?? undefined}
      >
        <CheckCircle2Icon className="size-3.5" />
        Sukses
      </span>
    )
  }
  return (
    <div className="flex max-w-[16rem] flex-col items-start gap-1">
      <span
        className={
          "rounded px-1.5 py-0.5 text-[11px] font-medium " +
          (row.canReupload
            ? "bg-destructive/10 text-destructive"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400")
        }
      >
        {row.canReupload ? "Gagal" : "Diproses"}
      </span>
      {row.statusMessage && (
        <span
          className="line-clamp-2 text-[11px] leading-snug text-destructive/90"
          title={row.statusMessage}
        >
          {row.statusMessage}
        </span>
      )}
    </div>
  )
}

export function HasilTab() {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [shopId, setShopId] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string | null>("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const resetPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }))

  const { data: stores = [] } = useConnectedStores()
  const storeOptions = React.useMemo(
    () =>
      stores.map((s) => ({
        value: s.shop_id,
        label: s.shop_name,
        hint: s.channel?.name ?? undefined,
      })),
    [stores]
  )

  const { data, isLoading } = useUploadHistories({
    search: search || undefined,
    status: status || undefined,
    shopId: shopId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const items = data?.items ?? []
  const total = data?.meta?.total ?? 0

  const reupload = useReuploadHistory()
  const bulkDelete = useBulkDeleteHistories()

  const hasFilter =
    !!search || !!status || !!shopId || !!dateFrom || !!dateTo

  const onReset = () => {
    setSearchInput("")
    setSearch("")
    setShopId(null)
    setStatus("")
    setDateFrom("")
    setDateTo("")
    resetPage()
  }

  const columns = React.useMemo<ColumnDef<HistoryRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Pilih semua"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Pilih baris"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 36,
      },
      {
        accessorKey: "itemGroupName",
        header: "Produk",
        cell: ({ row }) => {
          const h = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                {h.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={h.thumbnail}
                    alt={h.itemGroupName ?? ""}
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 truncate font-medium">
                {h.itemGroupName ?? "—"}
              </div>
            </div>
          )
        },
      },
      {
        id: "store",
        header: "Store",
        enableSorting: false,
        cell: ({ row }) => {
          const h = row.original
          return (
            <div className="flex items-center gap-2">
              <ChannelLogo
                code={(h.channelCode ?? "") as ChannelCode}
                name={h.channelName ?? "—"}
                className="size-7 rounded-lg"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {h.channelName ?? "—"}
                </div>
                {h.storeName && (
                  <div className="truncate text-xs text-muted-foreground">
                    {h.storeName}
                  </div>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "uploadDate",
        header: "Tgl. Upload",
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums text-sm text-muted-foreground">
            {fmtDate(row.original.uploadDate)}
          </span>
        ),
      },
      {
        accessorKey: "success",
        header: "Status",
        cell: ({ row }) => <HistoryStatus row={row.original} />,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Tindakan</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const h = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              {h.channelUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  asChild
                >
                  <a
                    href={h.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka di channel"
                  >
                    <ExternalLinkIcon className="size-4" />
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={!h.canReupload || reupload.isPending}
                onClick={() => reupload.mutate(h.id)}
              >
                <RotateCcwIcon className="size-3.5" />
                Re-upload
              </Button>
            </div>
          )
        },
        size: 48,
      },
    ],
    [reupload]
  )

  const filters = (
    <>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari produk…"
          className="h-9 rounded-lg border-border bg-background pl-9 pr-8"
        />
        {searchInput.length > 0 && (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            aria-label="Bersihkan pencarian"
            className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>
      <Combobox
        options={storeOptions}
        value={shopId}
        onChange={(v) => {
          setShopId(v)
          resetPage()
        }}
        placeholder="Pilih toko"
        searchPlaceholder="Cari toko"
        className="h-9 w-full rounded-lg"
      />
      <Combobox
        options={STATUS_OPTIONS}
        value={status}
        onChange={(v) => {
          setStatus(v ?? "")
          resetPage()
        }}
        placeholder="Semua status"
        searchPlaceholder="Cari status"
        className="h-9 w-full rounded-lg"
      />
      <div>
        <div className="mb-1.5 text-sm font-medium">Tanggal Upload</div>
        <div className="flex flex-col gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              resetPage()
            }}
            aria-label="Dari tanggal"
            className="h-9 rounded-lg border-border bg-background"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              resetPage()
            }}
            aria-label="Sampai tanggal"
            className="h-9 rounded-lg border-border bg-background"
          />
        </div>
      </div>
    </>
  )

  return (
    <FilterShell filters={filters} onReset={hasFilter ? onReset : undefined}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          <p>
            Produk yang berhasil di-upload ke channel lebih dari 30 hari akan
            otomatis terhapus dari halaman ini.
          </p>
        </div>

        <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
          <div className="flex items-center justify-end border-b border-border/60 px-5 py-3 sm:px-6">
            <span className="text-sm text-muted-foreground">
              Total <span className="font-medium text-foreground tabular-nums">{total}</span>
            </span>
          </div>
          <div className="px-5 py-5 sm:px-6">
            <DataTable
              columns={columns}
              data={items}
              getRowId={(h) => h.id}
              isLoading={isLoading}
              hideToolbar
              manualPagination
              rowCount={total}
              pagination={pagination}
              onPaginationChange={setPagination}
              enableRowSelection
              tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
              bulkActions={(selected, table) => (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={bulkDelete.isPending}
                  onClick={() =>
                    bulkDelete.mutate(
                      selected.map((h) => h.id),
                      { onSuccess: () => table.resetRowSelection() }
                    )
                  }
                >
                  Hapus
                </Button>
              )}
              emptyState={
                <span className="text-muted-foreground">Belum ada riwayat upload</span>
              }
            />
          </div>
        </LiquidGlass>
      </div>
    </FilterShell>
  )
}
