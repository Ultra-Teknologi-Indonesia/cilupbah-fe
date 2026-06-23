"use client"

import * as React from "react"
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
import { usePacklists } from "@/hooks/proses-pesanan/use-fulfillment"
import { PACKLIST_STATUS_LABEL, type Packlist } from "@/types/proses-pesanan/fulfillment"

import { UbahPackerDialog } from "./ubah-packer-dialog"

export function PacklistTable() {
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [editPacker, setEditPacker] = React.useState<Packlist | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({ q: debounced || undefined, page, per_page: 20 }),
    [debounced, page]
  )
  const { data, isLoading, isFetching, refetch } = usePacklists(params)

  const packlists = data?.items ?? []
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
            placeholder="Cari no. packlist…"
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
              <th className="px-3 py-3 font-medium">No. Packlist</th>
              <th className="px-3 py-3 font-medium">No. Pesanan</th>
              <th className="px-3 py-3 font-medium">Pelanggan</th>
              <th className="px-3 py-3 font-medium">Lokasi</th>
              <th className="px-3 py-3 font-medium">Packer</th>
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
            ) : packlists.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                  Tidak ada packlist.
                </td>
              </tr>
            ) : (
              packlists.map((p) => {
                const st = PACKLIST_STATUS_LABEL[p.status]
                return (
                  <tr key={p.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-foreground">{p.packlistNo}</td>
                    <td className="px-3 py-2.5">{p.orderNo ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.customerName ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.locationName ?? "—"}</td>
                    <td className="px-3 py-2.5">{p.packerName ?? "—"}</td>
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
                          <DropdownMenuItem onSelect={() => setEditPacker(p)}>
                            Ubah Packer
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

      <UbahPackerDialog
        open={!!editPacker}
        onOpenChange={(o) => !o && setEditPacker(null)}
        packlistId={editPacker?.id ?? null}
        packlistNo={editPacker?.packlistNo ?? null}
        locationId={editPacker?.locationId ?? null}
        currentPackerId={editPacker?.packerId ?? null}
      />
    </LiquidGlass>
  )
}
