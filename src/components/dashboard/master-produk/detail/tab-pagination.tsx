"use client"

import { SimplePagination, TABLE_PAGE_SIZES } from "@/components/ui/simple-pagination"

const PAGE_SIZES = TABLE_PAGE_SIZES

export function TabPagination({
  page,
  perPage,
  lastPage,
  isFetching,
  onPage,
  onPerPage,
}: {
  page: number
  perPage: number
  lastPage: number
  isFetching?: boolean
  onPage: (p: number) => void
  onPerPage: (n: number) => void
}) {
  return (
    <SimplePagination
      page={page}
      lastPage={lastPage}
      onPageChange={onPage}
      perPage={perPage}
      onPerPageChange={onPerPage}
      pageSizeOptions={PAGE_SIZES}
      isFetching={isFetching}
    />
  )
}

const STATUS_STYLE: Record<string, string> = {
  synced: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  in_review: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  pending: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  syncing: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  rejected: "text-destructive bg-destructive/10",
  failed: "text-destructive bg-destructive/10",
  deactivated: "text-muted-foreground bg-muted",
}
const STATUS_LABEL: Record<string, string> = {
  synced: "Tersinkron",
  in_review: "Direview",
  pending: "Menunggu",
  syncing: "Sinkron…",
  rejected: "Ditolak",
  failed: "Gagal",
  deactivated: "Nonaktif",
}

export function SyncStatusBadge({ status, reason }: { status: string | null; reason?: string | null }) {
  const s = status ?? ""
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[s] ?? "text-muted-foreground bg-muted"}`}
      title={reason && (s === "rejected" || s === "failed") ? reason : undefined}
    >
      {STATUS_LABEL[s] ?? s ?? "—"}
    </span>
  )
}
