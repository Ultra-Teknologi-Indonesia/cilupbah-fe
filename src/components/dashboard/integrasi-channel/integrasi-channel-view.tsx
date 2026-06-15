"use client"

import * as React from "react"
import { StoreIcon } from "lucide-react"
import { toast } from "sonner"

import type { ConnectedStore } from "@/types/channel"
import { MOCK_CHANNELS, MOCK_CONNECTED_STORES } from "@/app/dashboard/integrasi-channel/_data/mock"
import { ConnectMarketplacePanel } from "./connect-marketplace-panel"
import { ConnectedStoreCard } from "./connected-store-card"
import { ConnectedStoreCardSkeleton } from "./connected-store-card-skeleton"

function useIdSet() {
  const [ids, setIds] = React.useState<Set<string>>(new Set())
  const add = React.useCallback(
    (id: string) => setIds((p) => new Set(p).add(id)),
    []
  )
  const remove = React.useCallback(
    (id: string) =>
      setIds((p) => {
        const next = new Set(p)
        next.delete(id)
        return next
      }),
    []
  )
  return { has: (id: string) => ids.has(id), add, remove }
}

export function IntegrasiChannelView() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [stores, setStores] = React.useState<ConnectedStore[]>([])
  const refreshing = useIdSet()
  const disconnecting = useIdSet()

  // Simulasi pemuatan awal (akan diganti React Query saat integrasi BE).
  React.useEffect(() => {
    const t = setTimeout(() => {
      setStores(MOCK_CONNECTED_STORES)
      setIsLoading(false)
    }, 700)
    return () => clearTimeout(t)
  }, [])

  const handleRefresh = (store: ConnectedStore) => {
    refreshing.add(store.id)
    setTimeout(() => {
      refreshing.remove(store.id)
      toast.success(`Token ${store.shopName} diperbarui (mock)`)
    }, 800)
  }

  const handleDisconnect = (store: ConnectedStore) => {
    disconnecting.add(store.id)
    setTimeout(() => {
      disconnecting.remove(store.id)
      setStores((prev) => prev.filter((s) => s.id !== store.id))
      toast.success(`${store.shopName} diputuskan (mock)`)
    }, 700)
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">
            Toko Terhubung
            {!isLoading && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {stores.length} toko
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy
            aria-label="Memuat toko terhubung"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <ConnectedStoreCardSkeleton key={i} />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
            <StoreIcon className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Belum ada toko terhubung</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Hubungkan akun marketplace Anda untuk mulai sinkronisasi produk,
              stok, dan pesanan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <ConnectedStoreCard
                key={store.id}
                store={store}
                isRefreshing={refreshing.has(store.id)}
                isDisconnecting={disconnecting.has(store.id)}
                onRefresh={handleRefresh}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        )}
      </section>

      <ConnectMarketplacePanel
        channels={MOCK_CHANNELS}
        connectedCounts={stores.reduce<Record<string, number>>((acc, s) => {
          acc[s.channel.code] = (acc[s.channel.code] ?? 0) + 1
          return acc
        }, {})}
      />
    </div>
  )
}
