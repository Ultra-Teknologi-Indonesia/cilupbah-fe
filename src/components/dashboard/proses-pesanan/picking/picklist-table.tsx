"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  SearchIcon,
  RefreshCwIcon,
  MoreHorizontalIcon,
  Loader2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { usePicklists } from "@/hooks/proses-pesanan/use-fulfillment"
import { PICKLIST_STATUS_LABEL, type Picklist } from "@/types/proses-pesanan/fulfillment"

import { UbahPickerDialog } from "./ubah-picker-dialog"
import { DocActions } from "./doc-actions"

function ProgressCell({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  return (
    <div className="min-w-[140px]">
      <div className="mb-1 text-xs tabular-nums text-muted-foreground">
        {done} / {total}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function PicklistTable() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [editPicker, setEditPicker] = React.useState<Picklist | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({ q: debounced || undefined, page, per_page: 20 }),
    [debounced, page]
  )
  const { data, isLoading, isFetching, refetch } = usePicklists(params)

  const picklists = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 20, total: 0 }

  return (
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Cari no. picklist…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full p-1.5 transition-colors hover:bg-muted"
            aria-label="Muat ulang"
          >
            <RefreshCwIcon className={cn("size-4", isFetching && "animate-spin")} />
          </button>
          <span className="flex items-center gap-1.5">
            Total <Badge>{meta.total}</Badge>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-3 font-medium">No. Picklist</th>
              <th className="px-3 py-3 font-medium">Lokasi</th>
              <th className="px-3 py-3 font-medium">Picker</th>
              <th className="px-3 py-3 font-medium">Total Item</th>
              <th className="px-3 py-3 font-medium">Progress</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-muted-foreground">
                  <Loader2Icon className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            ) : picklists.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                  Tidak ada picklist.
                </td>
              </tr>
            ) : (
              picklists.map((p) => {
                const st = PICKLIST_STATUS_LABEL[p.status]
                return (
                  <tr key={p.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-foreground">{p.picklistNo}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.locationName ?? "—"}</td>
                    <td className="px-3 py-2.5">{p.pickerName ?? "—"}</td>
                    <td className="px-3 py-2.5 tabular-nums">{p.itemsCount}</td>
                    <td className="px-3 py-2.5">
                      <ProgressCell done={p.qtyPicked} total={p.qtyOrdered} />
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          st.className
                        )}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Aksi">
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                          <DropdownMenuItem
                            onSelect={() => router.push(`/dashboard/proses-pesanan/picking/${p.id}`)}
                          >
                            Proses Picking
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setEditPicker(p)}>
                            Ubah Picker
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => DocActions.pickListById(p.id)}>
                            Cetak Picklist
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <span className="text-xs text-muted-foreground">
          Halaman {meta.current_page} dari {meta.last_page}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Sebelumnya"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Berikutnya"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <UbahPickerDialog
        open={!!editPicker}
        onOpenChange={(o) => !o && setEditPicker(null)}
        picklistId={editPicker?.id ?? null}
        picklistNo={editPicker?.picklistNo ?? null}
        locationId={editPicker?.locationId ?? null}
        currentPickerId={editPicker?.pickerId ?? null}
      />
    </LiquidGlass>
  )
}
