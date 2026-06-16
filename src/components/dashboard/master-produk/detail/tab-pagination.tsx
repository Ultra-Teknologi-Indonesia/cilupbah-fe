"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PAGE_SIZES = [10, 20, 50, 100]


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
    <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Baris per halaman</span>
        <Select value={`${perPage}`} onValueChange={(v) => onPerPage(Number(v))}>
          <SelectTrigger className="h-8 w-[72px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((s) => (
              <SelectItem key={s} value={`${s}`}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFetching && <span className="text-xs text-muted-foreground">memuat…</span>}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm tabular-nums text-muted-foreground">
          Halaman {page} dari {lastPage}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-8" disabled={page <= 1} onClick={() => onPage(1)}>
            <ChevronsLeftIcon />
          </Button>
          <Button variant="outline" size="icon" className="size-8" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="outline" size="icon" className="size-8" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>
            <ChevronRightIcon />
          </Button>
          <Button variant="outline" size="icon" className="size-8" disabled={page >= lastPage} onClick={() => onPage(lastPage)}>
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
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

export function SyncStatusBadge({ status }: { status: string | null }) {
  const s = status ?? ""
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[s] ?? "text-muted-foreground bg-muted"}`}
    >
      {STATUS_LABEL[s] ?? s ?? "—"}
    </span>
  )
}
