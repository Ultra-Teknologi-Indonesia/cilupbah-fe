"use client"

import { Loader2Icon, RefreshCwIcon, Unlink2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
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
import type { ConnectedStore } from "@/types/channel"
import { ChannelLogo } from "./channel-logo"

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(iso))

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        active
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-muted-foreground/50"
        )}
      />
      {active ? "Aktif" : "Nonaktif"}
    </span>
  )
}

export function ConnectedStoreCard({
  store,
  isRefreshing = false,
  isDisconnecting = false,
  onRefresh,
  onDisconnect,
}: {
  store: ConnectedStore
  isRefreshing?: boolean
  isDisconnecting?: boolean
  onRefresh: (store: ConnectedStore) => void
  onDisconnect: (store: ConnectedStore) => void
}) {
  const busy = isRefreshing || isDisconnecting

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-opacity",
        isDisconnecting && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <ChannelLogo code={store.channel.code} name={store.channel.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">{store.shopName}</h3>
            <StatusPill active={store.isActive} />
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {store.channel.name} · ID {store.shopId}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Terhubung {fmtDate(store.connectedAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="outline"
          className="flex-1"
          disabled={busy}
          onClick={() => onRefresh(store)}
        >
          {isRefreshing ? (
            <>
              <Loader2Icon className="animate-spin motion-reduce:animate-none" />
              Memperbarui…
            </>
          ) : (
            <>
              <RefreshCwIcon />
              Refresh token
            </>
          )}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              disabled={busy}
              aria-label="Putuskan toko"
            >
              {isDisconnecting ? (
                <Loader2Icon className="animate-spin motion-reduce:animate-none" />
              ) : (
                <Unlink2Icon />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Putuskan toko?</DialogTitle>
              <DialogDescription>
                {store.shopName} ({store.channel.name}) akan diputuskan.
                Sinkronisasi pesanan & stok untuk toko ini akan berhenti.
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
      </div>
    </div>
  )
}
