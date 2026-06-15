"use client"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import type { ConnectedStore } from "@/types/channel"
import { ChannelLogo } from "./channel-logo"
import { StoreRowActions } from "./store-row-actions"

const STATUS_STYLE = {
  normal: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Normal",
    note: "",
  },
  warning: {
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "Perlu Perhatian",
    note: "text-amber-600 dark:text-amber-400",
  },
  error: {
    chip: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    label: "Integrasi Bermasalah",
    note: "text-destructive",
  },
} as const

function IntegrationStatus({ store }: { store: ConnectedStore }) {
  const status = store.integration.status
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.normal
  return (
    <div>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
          style.chip
        )}
      >
        <span aria-hidden className={cn("size-1.5 rounded-full", style.dot)} />
        {style.label}
      </span>
      {status !== "normal" && store.integration.note && (
        <p className={cn("mt-1 text-[11px]", style.note)}>
          {store.integration.note}
        </p>
      )}
    </div>
  )
}

export function StoresTable({
  stores,
  onToggleActive,
  onToggleOrders,
  onRefresh,
  onDisconnect,
}: {
  stores: ConnectedStore[]
  onToggleActive: (id: string, value: boolean) => void
  onToggleOrders: (id: string, value: boolean) => void
  onRefresh: (store: ConnectedStore) => void
  onDisconnect: (store: ConnectedStore) => void
}) {
  const showAccess = stores.some((s) => s.accessNote)
  const showLinked = stores.some((s) => s.linkedStore)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs font-medium text-muted-foreground">
            <th className="px-4 py-3">Nama Toko</th>
            <th className="px-4 py-3">Status Integrasi</th>
            {showAccess && <th className="px-4 py-3">Status Akses</th>}
            {showLinked && <th className="px-4 py-3">Toko Terhubung</th>}
            <th className="px-4 py-3 text-center">Toko Aktif</th>
            <th className="px-4 py-3 text-center">Pesanan</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr
              key={store.id}
              className="border-b border-border/40 last:border-0 hover:bg-muted/30"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <ChannelLogo
                    code={store.channel.code}
                    name={store.channel.name}
                    className="size-7 rounded-lg"
                  />
                  <span className="font-medium text-primary">{store.shopName}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <IntegrationStatus store={store} />
              </td>
              {showAccess && (
                <td className="px-4 py-3">
                  {store.accessNote ? (
                    <span className="text-xs text-destructive">{store.accessNote}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              )}
              {showLinked && (
                <td className="px-4 py-3">
                  {store.linkedStore ? (
                    <div className="flex items-center gap-2">
                      <ChannelLogo
                        code={store.linkedStore.code}
                        name={store.linkedStore.name}
                        className="size-6 rounded-md"
                      />
                      <span>{store.linkedStore.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              )}
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <Switch
                    checked={store.isActive}
                    onCheckedChange={(v) => onToggleActive(store.id, v)}
                    aria-label={`Toko aktif ${store.shopName}`}
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <Switch
                    checked={store.ordersEnabled}
                    onCheckedChange={(v) => onToggleOrders(store.id, v)}
                    aria-label={`Pesanan ${store.shopName}`}
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <StoreRowActions
                    store={store}
                    onRefresh={onRefresh}
                    onDisconnect={onDisconnect}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
