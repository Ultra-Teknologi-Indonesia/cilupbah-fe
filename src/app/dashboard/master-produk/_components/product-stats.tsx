import {
  BoxesIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import type { Product } from "../_data/mock-products"

export function ProductStats({ products }: { products: Product[] }) {
  const total = products.length
  const master = products.filter((p) => p.status === "master").length
  const review = products.filter((p) => p.status === "in_review").length
  const channelErrors = products.filter((p) =>
    p.onlineStatus.some((c) => c.errorText)
  ).length

  const cards = [
    { label: "Total Produk", value: total, icon: BoxesIcon, tone: "text-foreground" },
    { label: "Aktif (Master)", value: master, icon: CheckCircle2Icon, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Menunggu Review", value: review, icon: ClockIcon, tone: "text-amber-600 dark:text-amber-400" },
    { label: "Bermasalah di Channel", value: channelErrors, icon: AlertTriangleIcon, tone: "text-destructive" },
  ]

  return (
    <LiquidGlass
      radius={24}
      intensity="default"
      className="bg-white/40 dark:bg-white/[0.06]"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className={cn(
              "flex flex-col gap-2 p-4 sm:p-5",
              // Internal dividers — 2×2 on mobile, single row on desktop.
              i % 2 === 1 && "border-l border-border/60",
              i >= 2 && "border-t border-border/60",
              "lg:border-t-0 lg:border-l lg:border-border/60",
              i === 0 && "lg:border-l-0"
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
