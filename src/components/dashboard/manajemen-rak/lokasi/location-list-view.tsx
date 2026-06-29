"use client"

import * as React from "react"
import {
  InfoIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useDeleteLocation } from "@/hooks/manajemen-rak/use-delete-location"
import { useToggleLocationActive } from "@/hooks/manajemen-rak/use-toggle-location-active"
import {
  useWarehouseLayoutSetting,
  useSaveWarehouseLayoutSetting,
} from "@/hooks/manajemen-rak/use-warehouse-layout-setting"
import type { Location } from "@/types/manajemen-rak/location"

import { LocationTable } from "./location-table"
import { DeleteLocationDialog } from "./delete-location-dialog"

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === "string" && msg) return msg
  }
  return fallback
}

export function LocationListView() {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [deleteTarget, setDeleteTarget] = React.useState<Location | null>(null)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)

  // Debounce input pencarian + reset ke halaman 1.
  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, isError, isFetching } = useLocations({
    search,
    page,
    perPage: 20,
  })
  const setting = useWarehouseLayoutSetting()
  const saveSetting = useSaveWarehouseLayoutSetting()
  const deleteLocation = useDeleteLocation()
  const toggleActive = useToggleLocationActive()

  const locations = data?.items ?? []
  const total = data?.meta?.total ?? locations.length
  const currentPage = data?.meta?.current_page ?? page
  const lastPage = data?.meta?.last_page ?? 1

  function handleToggleActive(location: Location) {
    setTogglingId(location.id)
    toggleActive.mutate(
      { id: location.id, isActive: !location.isActive },
      {
        onError: (err) =>
          toast.error(getErrorMessage(err, "Gagal mengubah status aktif.")),
        onSettled: () => setTogglingId(null),
      }
    )
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    deleteLocation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Lokasi berhasil dihapus.")
        setDeleteTarget(null)
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, "Gagal menghapus lokasi.")),
    })
  }

  function handleToggleLayout(checked: boolean) {
    saveSetting.mutate(checked, {
      onSuccess: () =>
        toast.success(
          checked ? "Layout gudang diaktifkan." : "Layout gudang dinonaktifkan."
        ),
      onError: (err) =>
        toast.error(getErrorMessage(err, "Gagal menyimpan pengaturan.")),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari lokasi"
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Gunakan Layout Gudang</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Saat aktif, gudang dapat diatur layout rak (lantai/baris/kolom/rak).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Switch
            checked={setting.data?.useWarehouseLayout ?? false}
            disabled={setting.isLoading || saveSetting.isPending}
            onCheckedChange={handleToggleLayout}
            aria-label="Gunakan layout gudang"
          />
        </div>
      </div>

      {/* Tabel */}
      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex items-center justify-end px-5 py-3 text-sm text-muted-foreground">
          Total <Badge className="ml-2">{total}</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" /> Memuat lokasi…
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-destructive">
            Gagal memuat data lokasi.
          </div>
        ) : locations.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Belum ada lokasi.
          </div>
        ) : (
          <LocationTable
            locations={locations}
            togglingId={togglingId}
            onToggleActive={handleToggleActive}
            onDelete={(loc) => setDeleteTarget(loc)}
          />
        )}

        {!isLoading && !isError && (
          <div className="px-5 pb-3">
            <SimplePagination
              page={currentPage}
              lastPage={lastPage}
              onPageChange={setPage}
              total={total}
              label="lokasi"
              isFetching={isFetching}
            />
          </div>
        )}
      </LiquidGlass>

      <DeleteLocationDialog
        location={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={deleteLocation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteLocation.isPending) setDeleteTarget(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
