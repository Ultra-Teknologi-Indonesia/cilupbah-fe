import { cn } from "@/lib/utils"
import type { ChannelCode } from "@/types/channel"

const STYLES: Record<string, { bg: string; label: string }> = {
  tiktok: { bg: "bg-neutral-900 text-white", label: "TT" },
  lazada: { bg: "bg-[#0F146D] text-white", label: "LZ" },
  shopee: { bg: "bg-[#EE4D2D] text-white", label: "SP" },
  tokopedia: { bg: "bg-[#03AC0E] text-white", label: "TP" },
  blibli: { bg: "bg-[#0095DA] text-white", label: "BL" },
}

export function ChannelLogo({
  code,
  name,
  className,
}: {
  code: ChannelCode
  name: string
  className?: string
}) {
  const style = STYLES[code] ?? {
    bg: "bg-muted text-foreground",
    label: name.slice(0, 2).toUpperCase(),
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl text-xs font-semibold",
        style.bg,
        className
      )}
    >
      {style.label}
    </span>
  )
}
