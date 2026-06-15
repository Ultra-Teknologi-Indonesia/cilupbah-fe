"use client"

import * as React from "react"
import { StoreIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type {
  Channel,
  ChannelGroup as ChannelGroupType,
  ConnectedStore,
} from "@/types/channel"
import { groupStores } from "@/lib/channel/group-stores"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import {
  useConnectChannel,
  useDisconnectStore,
  useRefreshToken,
  useToggleStoreFlag,
} from "@/hooks/channel/use-channel-actions"
import { ChannelGroup } from "./channel-group"
import { ConnectMarketplacePanel } from "./connect-marketplace-panel"

function GroupSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="size-10 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
      </div>
      <div className="space-y-3 border-t border-border/60 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-6 w-full animate-pulse rounded bg-muted motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  )
}

export function IntegrasiChannelView() {
  const { data, isLoading, isError, refetch } = useConnectedStores()
  const toggle = useToggleStoreFlag()
  const disconnect = useDisconnectStore()
  const refresh = useRefreshToken()
  const { connect, pendingCode } = useConnectChannel()

  // Tangani hasil redirect OAuth (?connected=&count= / &error=).
  React.useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const connected = sp.get("connected")
    if (!connected) return

    const error = sp.get("error")
    if (error) {
      toast.error(`Gagal menghubungkan ${connected}: ${error}`)
    } else {
      const count = sp.get("count")
      toast.success(`${count ?? ""} toko ${connected} berhasil dihubungkan`.trim())
      refetch()
    }
    window.history.replaceState({}, "", "/dashboard/integrasi-channel")
  }, [refetch])

  const { groups, available } = React.useMemo(
    () => groupStores(data ?? []),
    [data]
  )

  const onToggleActive = (id: string, value: boolean) =>
    toggle.mutate({ id, flags: { is_active: value } })
  const onToggleOrders = (id: string, value: boolean) =>
    toggle.mutate({ id, flags: { order_sync_enabled: value } })
  const onDisconnect = (store: ConnectedStore) => disconnect.mutate(store.id)
  const onRefresh = (store: ConnectedStore) => {
    // Toko Tokopedia dikelola via TikTok (merger) → refresh lewat endpoint tiktok.
    const channel = store.channel.code === "tokopedia" ? "tiktok" : store.channel.code
    refresh.mutate({ channel, id: store.id })
  }
  const onAdd = (group: ChannelGroupType) => connect(group.code)
  const onConnect = (channel: Channel) => connect(channel.code)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <GroupSkeleton />
        <GroupSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
        <p className="text-sm font-medium">Gagal memuat daftar toko</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Coba lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <ChannelGroup
          key={group.id}
          group={group}
          onAdd={onAdd}
          onToggleActive={onToggleActive}
          onToggleOrders={onToggleOrders}
          onRefresh={onRefresh}
          onDisconnect={onDisconnect}
        />
      ))}

      {groups.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <StoreIcon className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Belum ada toko terhubung</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Hubungkan akun marketplace di bawah untuk mulai sinkronisasi produk,
            stok, dan pesanan.
          </p>
        </div>
      )}

      {available.length > 0 && (
        <ConnectMarketplacePanel
          channels={available}
          onConnect={onConnect}
          pendingCode={pendingCode}
        />
      )}
    </div>
  )
}
