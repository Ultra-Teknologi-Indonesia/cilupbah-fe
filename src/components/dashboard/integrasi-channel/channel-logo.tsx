import { cn } from "@/lib/utils"
import type { ChannelCode } from "@/types/channel"


const TILE: Record<string, string> = {
  tiktok: "bg-neutral-900",
  shopee: "bg-[#EE4D2D]",
  lazada: "bg-[#0F146D]",
  tokopedia: "bg-[#03AC0E]",
  blibli: "bg-[#0095DA]",
}

const HAS_ICON = new Set(Object.keys(TILE))

export function ChannelLogo({
  code,
  name,
  className,
}: {
  code: ChannelCode
  name: string
  className?: string
}) {
  
  if (!HAS_ICON.has(code)) {
    return (
      <span
        aria-hidden
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-xs font-semibold text-foreground",
          className
        )}
      >
        {name.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  const mask = `url(/channels/${code}.svg) center / contain no-repeat`

  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl",
        TILE[code],
        className
      )}
    >
      <span
        className="size-5 bg-white"
        style={{ mask, WebkitMask: mask }}
      />
    </span>
  )
}
