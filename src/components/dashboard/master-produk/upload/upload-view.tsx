"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  Loader2Icon,
  SearchIcon,
  SearchXIcon,
  StoreIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import {
  useUploadableQuery,
  useUploadToShop,
} from "@/hooks/master-produk/use-upload"
import { ShopPicker } from "./shop-picker"
import { uploadColumns } from "./upload-columns"

type Pending = { ids: string[]; reset: () => void }

export function UploadView() {
  const q = useUploadableQuery()
  const upload = useUploadToShop()
  const { data: stores = [] } = useConnectedStores()
  const [pending, setPending] = React.useState<Pending | null>(null)

  const items = q.result.data?.items ?? []
  const total = q.result.data?.meta?.total ?? 0

  const shopName =
    stores.find((s) => s.shop_id === q.shopId)?.shop_name ?? "toko terpilih"

  const confirmUpload = () => {
    if (!pending || !q.shopId) return
    upload.mutate(
      { productIds: pending.ids, shopId: q.shopId },
      {
        onSuccess: () => {
          pending.reset()
          setPending(null)
        },
      }
    )
  }

  return (
    <LiquidGlass
      radius={24}
      intensity="default"
      className="bg-white/40 dark:bg-white/[0.06]"
    >
      {/* Header + pemilih toko */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 className="text-base font-medium">Produk siap upload</h2>
          <p className="text-sm text-muted-foreground">
            {q.shopId
              ? q.result.isLoading
                ? "Memuat…"
                : `${total} produk belum ada di ${shopName}`
              : "Pilih toko tujuan untuk mulai"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StoreIcon className="size-4 text-muted-foreground" />
          <ShopPicker
            value={q.shopId}
            onChange={q.setShopId}
            className="h-9 w-56 rounded-full"
          />
        </div>
      </div>

      {!q.shopId ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <StoreIcon className="size-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Pilih toko tujuan</p>
            <p className="text-sm text-muted-foreground">
              Daftar produk yang belum terdaftar di toko akan muncul di sini.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Toolbar pencarian */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-5 py-3 sm:px-6">
            <div className="relative w-full max-w-xs sm:w-64">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q.search}
                onChange={(e) => q.setSearch(e.target.value)}
                placeholder="Cari nama / SKU…"
                className="h-9 rounded-full border-border bg-background pl-9 pr-8"
              />
              {q.search.length > 0 && (
                <button
                  type="button"
                  onClick={() => q.setSearch("")}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-5 sm:px-6">
            {q.result.isError ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertTriangleIcon className="size-8 text-destructive" />
                <div>
                  <p className="font-medium">Gagal memuat produk</p>
                  <p className="text-sm text-muted-foreground">
                    Periksa koneksi atau coba lagi.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => q.result.refetch()}
                  disabled={q.result.isFetching}
                >
                  Coba lagi
                </Button>
              </div>
            ) : (
              <DataTable
                columns={uploadColumns}
                data={items}
                isLoading={q.result.isLoading}
                getRowId={(p) => p.id}
                hideToolbar
                manualPagination
                rowCount={total}
                pagination={q.pagination}
                onPaginationChange={q.setPagination}
                enableRowSelection
                tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
                bulkActions={(selected, table) => (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setPending({
                        ids: selected.map((p) => p.id),
                        reset: () => table.resetRowSelection(),
                      })
                    }
                  >
                    <UploadIcon className="size-4" />
                    Upload ke channel
                  </Button>
                )}
                emptyState={
                  <div className="flex flex-col items-center gap-2 py-6">
                    <SearchXIcon className="size-8 text-muted-foreground" />
                    <p className="font-medium">Tidak ada produk untuk diupload</p>
                    <p className="text-sm text-muted-foreground">
                      Semua produk yang cocok sudah terdaftar di toko ini.
                    </p>
                  </div>
                }
              />
            )}
          </div>
        </>
      )}

      {/* Dialog konfirmasi upload */}
      <Dialog
        open={!!pending}
        onOpenChange={(o) => {
          if (!o && !upload.isPending) setPending(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload ke channel?</DialogTitle>
            <DialogDescription>
              {pending?.ids.length ?? 0} produk akan diunggah ke{" "}
              <span className="font-medium text-foreground">{shopName}</span> dan
              masuk antrean sinkronisasi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={upload.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={confirmUpload}
              disabled={upload.isPending}
            >
              {upload.isPending ? (
                <Loader2Icon className="animate-spin motion-reduce:animate-none" />
              ) : (
                <UploadIcon />
              )}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LiquidGlass>
  )
}
