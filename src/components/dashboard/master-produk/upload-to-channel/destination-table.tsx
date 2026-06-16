"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  Loader2Icon,
  PencilIcon,
  RotateCwIcon,
  UploadCloudIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table/data-table"
import { ChannelLogo } from "@/components/dashboard/integrasi-channel/channel-logo"
import { SyncStatusBadge } from "@/components/dashboard/master-produk/detail/tab-pagination"
import {
  useMatchListing,
  useUploadListing,
  useUploadToStores,
} from "@/hooks/master-produk/use-upload"
import type {
  MatchRow,
  UploadDestination,
} from "@/services/master-produk/upload.service"
import type { ChannelCode } from "@/types/channel/channel.types"

type MatchState = { matched: boolean; message: string }

/** Aggregate the API's one-row-per-(store × master-variant) into one row per store. */
function aggregateMatches(rows: MatchRow[]): Map<string, MatchState> {
  const byStore = new Map<string, MatchRow[]>()
  for (const r of rows) {
    const list = byStore.get(r.storeId) ?? []
    list.push(r)
    byStore.set(r.storeId, list)
  }

  const result = new Map<string, MatchState>()
  for (const [storeId, list] of byStore) {
    const allMatched = list.every((r) => r.matched)
    const firstFail = list.find((r) => !r.matched)
    result.set(storeId, {
      matched: allMatched,
      message: allMatched ? "Sesuai sama master" : firstFail?.message ?? "Tidak cocok",
    })
  }
  return result
}

export function DestinationTable({
  productId,
  productName,
  isUploaded,
  search,
  channel,
}: {
  productId: string
  productName: string
  isUploaded: boolean
  search?: string
  channel?: string
}) {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 25 })

  // Reset to first page whenever the filters change (render-phase adjustment).
  const filterKey = `${search}|${channel ?? ""}`
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey)
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey)
    if (pagination.pageIndex !== 0) setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const listing = useUploadListing(productId, {
    isUploaded,
    search,
    channel,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const match = useMatchListing(productId)
  const upload = useUploadToStores(productId)

  const rows = React.useMemo(() => listing.data?.items ?? [], [listing.data])
  const total = listing.data?.meta?.total ?? 0

  // Kecocokan results + in-flight stores.
  const [matchMap, setMatchMap] = React.useState<Map<string, MatchState>>(new Map())
  const [matching, setMatching] = React.useState<Set<string>>(new Set())

  const mergeMatches = React.useCallback((next: Map<string, MatchState>) => {
    setMatchMap((prev) => {
      const merged = new Map(prev)
      for (const [k, v] of next) merged.set(k, v)
      return merged
    })
  }, [])

  const runMatch = React.useCallback(
    (storeIds: string[]) => {
      const ids = Array.from(new Set(storeIds)).filter(Boolean)
      if (ids.length === 0) return
      setMatching((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.add(id))
        return next
      })
      match.mutate(ids, {
        onSuccess: (res) => mergeMatches(aggregateMatches(res)),
        onSettled: () => {
          setMatching((prev) => {
            const next = new Set(prev)
            ids.forEach((id) => next.delete(id))
            return next
          })
        },
      })
    },
    [match, mergeMatches]
  )

  // Auto-run match once per loaded page, guarded against loops.
  const requestedKey = React.useRef<string>("")
  React.useEffect(() => {
    const storeIds = Array.from(new Set(rows.map((r) => r.storeId).filter(Boolean)))
    const key = storeIds.join("|")
    if (!key || key === requestedKey.current) return
    requestedKey.current = key
    runMatch(storeIds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  const columns = React.useMemo<ColumnDef<UploadDestination>[]>(
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
            onClick={(e) => e.stopPropagation()}
            aria-label="Pilih baris"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 36,
      },
      {
        id: "channel",
        header: "Channel",
        enableSorting: false,
        cell: ({ row }) => {
          const d = row.original
          return (
            <div className="flex items-center gap-3">
              <ChannelLogo
                code={(d.channelCode ?? "") as ChannelCode}
                name={d.channelName ?? "—"}
                className="size-9"
              />
              <span className="font-medium">{d.channelName ?? "—"}</span>
            </div>
          )
        },
      },
      {
        id: "toko",
        header: "Toko",
        enableSorting: false,
        cell: ({ row }) => {
          const d = row.original
          return (
            <div className="flex flex-col gap-0.5">
              <span className="truncate">{d.storeName ?? "—"}</span>
              {isUploaded && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {d.channelGroupId && (
                    <span className="font-mono tabular-nums">{d.channelGroupId}</span>
                  )}
                  <SyncStatusBadge status={d.syncStatus} />
                </div>
              )}
            </div>
          )
        },
      },
      {
        id: "keterangan",
        header: "Keterangan",
        enableSorting: false,
        cell: () => <span className="text-muted-foreground">—</span>,
      },
      {
        id: "kecocokan",
        header: "Kecocokan Data Master dengan Channel",
        enableSorting: false,
        cell: ({ row }) => {
          const storeId = row.original.storeId
          const state = matchMap.get(storeId)
          const isMatching = matching.has(storeId)

          if (!state && isMatching) {
            return (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />
                memeriksa…
              </span>
            )
          }
          if (!state) {
            return <span className="text-sm text-muted-foreground">—</span>
          }
          if (state.matched) {
            return (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircleIcon className="size-4" />
                Cocok
              </span>
            )
          }
          return (
            <span
              className="inline-flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400"
              title={state.message}
            >
              <AlertTriangleIcon className="size-4 shrink-0" />
              <span className="truncate">{state.message}</span>
            </span>
          )
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Aksi</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const d = row.original
          const isMatching = matching.has(d.storeId)
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isMatching}
                onClick={(e) => {
                  e.stopPropagation()
                  runMatch([d.storeId])
                }}
                title="Cocokkan data dengan master"
                aria-label="Cocokkan"
              >
                {isMatching ? (
                  <Loader2Icon className="animate-spin motion-reduce:animate-none" />
                ) : (
                  <RotateCwIcon />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled
                title="Segera"
                aria-label="Edit"
              >
                <PencilIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!d.shopId || upload.isPending}
                onClick={(e) => {
                  e.stopPropagation()
                  if (d.shopId) upload.mutate([d.shopId])
                }}
                title={d.shopId ? "Upload ke channel" : "Toko tidak punya shop id"}
                aria-label="Upload"
              >
                <UploadCloudIcon />
              </Button>
            </div>
          )
        },
        size: 132,
      },
    ],
    [isUploaded, matchMap, matching, runMatch, upload]
  )

  const [confirmRows, setConfirmRows] = React.useState<UploadDestination[] | null>(null)

  return (
    <>
      <DataTable<UploadDestination, unknown>
        columns={columns}
        data={rows}
        getRowId={(row) => row.storeId}
        isLoading={listing.isLoading}
        hideToolbar
        enableRowSelection
        manualPagination
        rowCount={total}
        pagination={pagination}
        onPaginationChange={setPagination}
        tableContainerClassName="rounded-2xl"
        emptyState={
          <span className="text-muted-foreground">
            {isUploaded
              ? "Produk belum diupload ke toko mana pun."
              : "Semua toko sudah terdaftar untuk produk ini."}
          </span>
        }
        bulkActions={(selected, table) => (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => runMatch(selected.map((r) => r.storeId))}
            >
              <RotateCwIcon className="size-4" />
              Cocokan data dengan master
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="gap-2"
              disabled={upload.isPending}
              onClick={() => setConfirmRows(selected)}
            >
              <UploadCloudIcon className="size-4" />
              Upload
            </Button>
            {confirmRows && (
              <Dialog
                open={!!confirmRows}
                onOpenChange={(o) => {
                  if (!o) setConfirmRows(null)
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload ke channel</DialogTitle>
                    <DialogDescription>
                      Upload <span className="font-medium">{productName}</span> ke{" "}
                      {confirmRows.filter((r) => r.shopId).length} toko{" "}
                      {isUploaded ? "(upload ulang)" : "yang belum terdaftar"}?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Batal</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="primary"
                        onClick={() => {
                          const shopIds = confirmRows
                            .map((r) => r.shopId)
                            .filter((id): id is string => !!id)
                          if (shopIds.length > 0) upload.mutate(shopIds)
                          setConfirmRows(null)
                          table.resetRowSelection()
                        }}
                      >
                        Upload
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      />

      {listing.isError && (
        <p className={cn("mt-3 text-sm text-destructive")}>
          Gagal memuat daftar toko.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => listing.refetch()}
          >
            Coba lagi
          </button>
        </p>
      )}
    </>
  )
}
