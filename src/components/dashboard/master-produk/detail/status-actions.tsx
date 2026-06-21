"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArchiveIcon,
  ArrowUpRightIcon,
  Loader2Icon,
  PencilIcon,
  RotateCcwIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ProductDetail } from "@/types/master-produk"
import type { LifecycleAction } from "@/services/master-produk/product-detail.service"

type Confirm = {
  action: LifecycleAction
  title: string
  description: string
  withReason?: boolean
  destructive?: boolean
}

export function StatusActions({
  product,
  isPending,
  onAction,
}: {
  product: ProductDetail
  isPending: boolean
  onAction: (action: LifecycleAction, opts?: { reason?: string }) => void
}) {
  const [confirm, setConfirm] = React.useState<Confirm | null>(null)
  const [reason, setReason] = React.useState("")

  const editHref = `/dashboard/master-produk/${product.id}/edit`

  const spinner = <Loader2Icon className="animate-spin motion-reduce:animate-none" />
  const editBtn = (
    <Button variant="outline" asChild disabled={isPending}>
      <Link href={editHref} prefetch={false}>
        <PencilIcon />
        Edit
      </Link>
    </Button>
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      {product.status === "master" && (
        <>
          {editBtn}
          <Button variant="outline" asChild disabled={isPending}>
            <Link href={`/dashboard/produk/${product.id}/upload-to-channel`} prefetch={false}>
              <ArrowUpRightIcon />
              Upload ke channel
            </Link>
          </Button>
        </>
      )}

      {product.status === "archived" && (
        <Button variant="primary" disabled={isPending} onClick={() => onAction("restore")}>
          {isPending ? spinner : <RotateCcwIcon />}
          Pulihkan
        </Button>
      )}

      {product.status !== "archived" && (
        <Button
          variant="destructive"
          disabled={isPending}
          onClick={() =>
            setConfirm({
              action: "archive",
              title: "Arsipkan produk?",
              description: "Produk dipindahkan ke arsip dan tidak tampil di katalog aktif.",
              withReason: true,
              destructive: true,
            })
          }
        >
          <ArchiveIcon />
          Arsipkan
        </Button>
      )}

      {/* Generic Confirm Dialog (archive) */}
      <Dialog
        open={!!confirm}
        onOpenChange={(o) => {
          if (!o) {
            setConfirm(null)
            setReason("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm?.title}</DialogTitle>
            <DialogDescription>{confirm?.description}</DialogDescription>
          </DialogHeader>
          {confirm?.withReason && (
            <Textarea
              placeholder="Alasan (opsional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={255}
            />
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant={confirm?.destructive ? "destructive" : "primary"}
                onClick={() => {
                  if (confirm) onAction(confirm.action, { reason: reason.trim() || undefined })
                  setReason("")
                }}
              >
                Lanjutkan
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
