"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { CheckIcon, ImageIcon, Loader2Icon, PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChannelProductService } from "@/services/master-produk/channel-product.service"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string | null
  existingMappingIds: Set<string>
  onAdd: (mappingId: string) => void
  addingId: string | null
}

export function NaikkanProdukPickerDialog({
  open,
  onOpenChange,
  shopId,
  existingMappingIds,
  onAdd,
  addingId,
}: Props) {
  const [search, setSearch] = React.useState("")
  const [appliedSearch, setAppliedSearch] = React.useState("")
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    if (!open) {
      setSearch("")
      setAppliedSearch("")
      setPage(1)
    }
  }, [open])

  const query = useQuery({
    queryKey: ["naikkan", "picker", shopId, appliedSearch, page],
    queryFn: () =>
      ChannelProductService.list({
        shopId: shopId!,
        search: appliedSearch || undefined,
        page,
        perPage: 10,
      }),
    enabled: open && !!shopId,
  })

  const items = query.data?.items ?? []
  const total = query.data?.meta?.total ?? 0
  const lastPage = query.data?.meta?.last_page ?? 1

  const applySearch = () => {
    setAppliedSearch(search)
    setPage(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Produk</DialogTitle>
          <DialogDescription>
            Pilih produk channel untuk ditambahkan ke daftar naikkan.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch()
              }}
              placeholder="Cari produk..."
              className="h-9 pl-9"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={applySearch}>
            Cari
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Tidak ada produk ditemukan.
            </p>
          ) : (
            <div className="divide-y">
              {items.map((item) => {
                const isAdded = item.mappingId ? existingMappingIds.has(item.mappingId) : false
                const isAdding = item.mappingId === addingId

                return (
                  <div
                    key={item.mappingId ?? item.channelGroupId}
                    className="flex items-center gap-3 px-1 py-2.5"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                      {item.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail}
                          alt={item.itemGroupName ?? ""}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">
                        {item.itemGroupName ?? "—"}
                      </p>
                      <p className="line-clamp-1 font-mono text-xs text-muted-foreground">
                        {item.variants.map((v) => v.masterSku ?? v.channelSku).filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>

                    {isAdded ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckIcon className="size-3.5" />
                        Ditambahkan
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={!item.mappingId || isAdding}
                        onClick={() => item.mappingId && onAdd(item.mappingId)}
                      >
                        {isAdding ? (
                          <Loader2Icon className="size-3 animate-spin" />
                        ) : (
                          <PlusIcon className="size-3" />
                        )}
                        Tambah
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">
              {total} produk ditemukan
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <span className="px-2 text-xs tabular-nums text-muted-foreground">
                {page}/{lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
