"use client"

import * as React from "react"
import { MoreHorizontalIcon, RefreshCwIcon, Unlink2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ConnectedStore } from "@/types/channel"

export function StoreRowActions({
  store,
  onRefresh,
  onDisconnect,
}: {
  store: ConnectedStore
  onRefresh: (store: ConnectedStore) => void
  onDisconnect: (store: ConnectedStore) => void
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Aksi ${store.shopName}`}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => onRefresh(store)}>
            <RefreshCwIcon className="size-4 text-muted-foreground" />
            Refresh token
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirmOpen(true)}
          >
            <Unlink2Icon className="size-4" />
            Putuskan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Putuskan toko?</DialogTitle>
            <DialogDescription>
              {store.shopName} ({store.channel.name}) akan diputuskan. Sinkronisasi
              pesanan & stok untuk toko ini akan berhenti.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive" onClick={() => onDisconnect(store)}>
                Putuskan
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
