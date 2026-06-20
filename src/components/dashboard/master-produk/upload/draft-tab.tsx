"use client"

import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import {
  ImageIcon,
  Loader2Icon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
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
import {
  useChannelDrafts,
  useDeleteDraft,
  useUploadDraft,
} from "@/hooks/master-produk/use-upload"
import type { DraftRow, DraftStatus } from "@/services/master-produk/upload.service"
import type { ChannelCode } from "@/types/channel"
import { ChannelLogo } from "@/components/dashboard/integrasi-channel/channel-logo"
import { FilterShell } from "../filter-shell"
import { SyncStatusBadge } from "../detail/tab-pagination"

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "ready", label: "Siap" },
  { value: "cancelled", label: "Dibatalkan" },
]

type DeletePending = { productId: string; draftId: string; name: string }

export function DraftTab({
  tabBar,
  actionButton,
}: {
  tabBar?: React.ReactNode
  actionButton?: React.ReactNode
}) {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<string | null>("")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })
  const [deletePending, setDeletePending] = React.useState<DeletePending | null>(
    null
  )

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading } = useChannelDrafts({
    search: search || undefined,
    status: (status || undefined) as DraftStatus | undefined,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const items = data?.items ?? []
  const total = data?.meta?.total ?? 0

  const uploadDraft = useUploadDraft()
  const deleteDraft = useDeleteDraft()

  const confirmDelete = () => {
    if (!deletePending) return
    deleteDraft.mutate(
      { productId: deletePending.productId, draftId: deletePending.draftId },
      { onSuccess: () => setDeletePending(null) }
    )
  }

  const columns = React.useMemo<ColumnDef<DraftRow>[]>(
    () => [
      {
        accessorKey: "itemGroupName",
        header: "Produk",
        cell: ({ row }) => {
          const d = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                {d.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.thumbnail}
                    alt={d.itemGroupName ?? ""}
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium">
                  {d.itemGroupName ?? "—"}
                </div>
                {d.storeName && (
                  <div className="truncate text-xs text-muted-foreground">
                    {d.storeName}
                  </div>
                )}
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
          const d = row.original
          return (
            <div className="flex items-center gap-2">
              <ChannelLogo
                code={(d.channelCode ?? "") as ChannelCode}
                name={d.channelName ?? "—"}
                className="size-7 rounded-lg"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {d.channelName ?? "—"}
                </div>
                {d.storeName && (
                  <div className="truncate text-xs text-muted-foreground">
                    {d.storeName}
                  </div>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <SyncStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const d = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={!d.canUpload || uploadDraft.isPending}
                onClick={() => uploadDraft.mutate(d.id)}
              >
                <UploadIcon className="size-3.5" />
                Upload
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Hapus draft"
                onClick={() =>
                  setDeletePending({
                    productId: d.itemGroupId,
                    draftId: d.id,
                    name: d.itemGroupName ?? "draft ini",
                  })
                }
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          )
        },
        size: 48,
      },
    ],
    [uploadDraft]
  )

  const hasFilter = !!searchInput || !!status
  const onReset = () => {
    setSearchInput("")
    setSearch("")
    setStatus("")
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const filters = (
    <>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari produk…"
          className="h-9 border-border bg-background pl-9 pr-8"
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
        options={STATUS_OPTIONS}
        value={status}
        onChange={(v) => {
          setStatus(v ?? "")
          setPagination((p) => ({ ...p, pageIndex: 0 }))
        }}
        placeholder="Semua status"
        searchPlaceholder="Cari status"
        className="h-9 w-full"
      />
    </>
  )

  return (
    <FilterShell filters={filters} onReset={hasFilter ? onReset : undefined}>
      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 pt-3 sm:px-5">
          <div className="overflow-x-auto">{tabBar}</div>
          <div className="flex items-center gap-3 pb-2">
            {actionButton}
            <span className="text-sm text-muted-foreground">
              Total <span className="font-medium text-foreground tabular-nums">{total}</span>
            </span>
          </div>
        </div>
        <div className="px-5 py-5 sm:px-6">
          <DataTable
            columns={columns}
            data={items}
            getRowId={(d) => d.id}
            isLoading={isLoading}
            hideToolbar
            manualPagination
            rowCount={total}
            pagination={pagination}
            onPaginationChange={setPagination}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <span className="text-muted-foreground">Belum ada draft upload</span>
            }
          />
        </div>
      </LiquidGlass>

      <Dialog
        open={!!deletePending}
        onOpenChange={(o) => {
          if (!o && !deleteDraft.isPending) setDeletePending(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus draft?</DialogTitle>
            <DialogDescription>
              Draft untuk{" "}
              <span className="font-medium text-foreground">
                {deletePending?.name}
              </span>{" "}
              akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleteDraft.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteDraft.isPending}
            >
              {deleteDraft.isPending ? (
                <Loader2Icon className="animate-spin motion-reduce:animate-none" />
              ) : (
                <Trash2Icon />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FilterShell>
  )
}
