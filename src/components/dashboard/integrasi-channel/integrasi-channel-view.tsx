"use client"

import * as React from "react"
import { toast } from "sonner"

import type { ChannelGroup as ChannelGroupType } from "@/types/channel"
import {
  MOCK_AVAILABLE_CHANNELS,
  MOCK_CHANNEL_GROUPS,
} from "@/app/dashboard/integrasi-channel/_data/mock"
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
  const [isLoading, setIsLoading] = React.useState(true)
  const [groups, setGroups] = React.useState<ChannelGroupType[]>([])

  React.useEffect(() => {
    const t = setTimeout(() => {
      setGroups(MOCK_CHANNEL_GROUPS)
      setIsLoading(false)
    }, 700)
    return () => clearTimeout(t)
  }, [])

  const patchStore = (
    id: string,
    patch: Partial<{ isActive: boolean; ordersEnabled: boolean }>
  ) =>
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        stores: g.stores.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }))
    )

  const onToggleActive = (id: string, value: boolean) =>
    patchStore(id, { isActive: value })
  const onToggleOrders = (id: string, value: boolean) =>
    patchStore(id, { ordersEnabled: value })
  const onAdd = (group: ChannelGroupType) =>
    toast.info(`Hubungkan toko ${group.name} — menunggu integrasi OAuth`)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <GroupSkeleton />
        <GroupSkeleton />
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
        />
      ))}

      {MOCK_AVAILABLE_CHANNELS.length > 0 && (
        <ConnectMarketplacePanel channels={MOCK_AVAILABLE_CHANNELS} />
      )}
    </div>
  )
}
