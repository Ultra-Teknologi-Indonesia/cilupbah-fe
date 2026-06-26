"use client"

import * as React from "react"
import Link from "next/link"
import { ImageIcon, Loader2Icon, RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ArchivedProduct } from "@/types/master-produk"

const fmtDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(iso)) : "—"

function RestoreButton({
  item,
  pending,
  onRestore,
}: {
  item: ArchivedProduct
  pending: boolean
  onRestore: (item: ArchivedProduct) => void
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin motion-reduce:animate-none" /> : <RotateCcwIcon />}
          Pulihkan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pulihkan produk?</DialogTitle>
          <DialogDescription>
            {item.itemName} akan dikembalikan ke status Master dan tampil kembali di katalog aktif.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="primary" onClick={() => onRestore(item)}>
              Pulihkan
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ArchiveTable({
  items,
  pendingId,
  onRestore,
}: {
  items: ArchivedProduct[]
  pendingId: string | null
  onRestore: (item: ArchivedProduct) => void
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs font-medium text-muted-foreground">
            <th className="px-4 py-3">Produk</th>
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3">Diarsipkan</th>
            <th className="px-4 py-3">Alasan</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.itemGroupId} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted/40">
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumbnail} alt={item.itemName} className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/produk/${item.itemGroupId}`}
                     
                      className="truncate font-medium hover:text-primary hover:underline"
                    >
                      {item.itemName}
                    </Link>
                    <div className="font-mono text-xs text-muted-foreground">
                      {item.sku ?? "—"} · {item.totalVariants} varian
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{item.categoryName}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {fmtDate(item.archivedAt)}
                {item.archivedBy && <div className="text-xs">oleh {item.archivedBy}</div>}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{item.archiveReason || "—"}</td>
              <td className="px-4 py-3 text-right">
                <RestoreButton
                  item={item}
                  pending={pendingId === item.itemGroupId}
                  onRestore={onRestore}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
