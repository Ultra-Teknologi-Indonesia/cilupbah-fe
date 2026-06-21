import {
  BoxesIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import type { Product } from "@/types/master-produk"

export function ProductStats({
  products,
  total: totalOverride,
}: {
  products: Product[]
  total?: number
}) {
  const total = totalOverride ?? products.length
  const master = products.filter((p) => p.status === "master").length
  const channelErrors = products.filter((p) =>
    p.onlineStatus.some((c) => c.errorText)
  ).length

  const cards = [
    { label: "Total Produk", value: total, icon: BoxesIcon, tone: "text-foreground" },
    { label: "Aktif (Master)", value: master, icon: CheckCircle2Icon, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Bermasalah di Channel", value: channelErrors, icon: AlertTriangleIcon, tone: "text-destructive" },
  ]

  return (
    <LiquidGlass
      radius={24}
      intensity="default"
      className="bg-white/40 dark:bg-white/[0.06]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className={cn(
              "flex flex-col gap-2 p-4 sm:p-5",
              i > 0 && "border-t border-border/60 sm:border-t-0 sm:border-l"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={cn("size-4", c.tone)} />
            </div>
            <div className="text-2xl font-semibold tabular-nums">{c.value}</div>
          </div>
        ))}
      </div>
    </LiquidGlass>
  )
}
