"use client"

import { useOrderCounts } from "@/hooks/pesanan/use-orders"
import { TAB_CONFIG, SUB_PILL_CONFIG, type OrderTab, type SubFilter } from "@/types/pesanan/order"
import { PillTab, PillTabs } from "@/components/dashboard/shared/pill-tabs"
import { Separator } from "@/components/ui/separator"

export function OrderStatusTabs({
  active,
  onChange,
}: {
  active: OrderTab
  onChange: (tab: OrderTab) => void
}) {
  const { data, isLoading } = useOrderCounts()
  const counts = data?.data

  const zones = ["lifecycle", "problem", "admin"] as const
  const grouped = zones.map((z) => TAB_CONFIG.filter((t) => t.zone === z))

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {grouped.map((tabs, zi) => (
        <div key={zi} className="contents">
          {zi > 0 && (
            <Separator orientation="vertical" className="!h-6 mx-1" />
          )}
          {tabs.map(({ key, label }) => (
            <PillTab
              key={key}
              item={{
                key: key as OrderTab,
                label,
                count: counts?.[key as keyof typeof counts] ?? null,
                countLoading: isLoading,
              }}
              active={active === key}
              onSelect={onChange}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function OrderSubStatusPills({
  active,
  subFilter,
  onSubFilterChange,
}: {
  active: OrderTab
  subFilter: SubFilter
  onSubFilterChange: (sub: SubFilter) => void
}) {
  const subPills = SUB_PILL_CONFIG[active]
  if (!subPills) return null

  return (
    <PillTabs
      variant="soft"
      className="gap-1"
      active={subFilter ?? "__all__"}
      onSelect={(key) => onSubFilterChange(key === "__all__" ? null : (key as SubFilter))}
      items={[
        { key: "__all__", label: "Semua" },
        ...subPills.map(({ key, label }) => ({ key, label })),
      ]}
    />
  )
}
