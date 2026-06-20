import { AlertTriangleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ProductChannelStatus } from "@/types/master-produk"

const CHANNEL_BG: Record<string, string> = {
  shopee: "bg-[#EE4D2D]",
  tokopedia: "bg-[#03AC0E]",
  tiktok: "bg-neutral-900",
  lazada: "bg-[#0F146D]",
}

function ChannelDot({ ch }: { ch: ProductChannelStatus }) {
  const hasError = !!ch.errorText
  const bg = CHANNEL_BG[ch.channelCode]
  const hasIcon = !!bg

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "relative flex size-6 items-center justify-center rounded-full ring-2 ring-card",
            hasIcon ? bg : "bg-muted-foreground"
          )}
        >
          {hasIcon ? (
            <span
              className="size-3.5 bg-white"
              style={{
                mask: `url(/channels/${ch.channelCode}.svg) center / contain no-repeat`,
                WebkitMask: `url(/channels/${ch.channelCode}.svg) center / contain no-repeat`,
              }}
            />
          ) : (
            <span className="text-[11px] font-semibold text-white">
              {ch.channelName.charAt(0).toUpperCase()}
            </span>
          )}
          {hasError && (
            <span className="absolute -right-0.5 -top-0.5 flex size-3 items-center justify-center rounded-full bg-destructive text-white ring-2 ring-card">
              <AlertTriangleIcon className="size-2" />
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">
          {ch.channelName} · {ch.storeName}
        </p>
        {hasError ? (
          <p className="text-destructive">{ch.errorText}</p>
        ) : (
          <p className="text-muted-foreground">Tersinkron</p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

export function ProductChannelBadges({
  channels,

  max,
}: {
  channels: ProductChannelStatus[]
  max?: number
}) {
  if (channels.length === 0) {
    return null
  }

  const overflowing = max !== undefined && channels.length > max
  const visible = overflowing ? channels.slice(0, max - 1) : channels
  const hidden = overflowing ? channels.slice(max - 1) : []
  const hiddenHasError = hidden.some((c) => c.errorText)

  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((ch, i) => (
        <ChannelDot key={`${ch.channelCode}-${i}`} ch={ch} />
      ))}

      {hidden.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="relative flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-2 ring-card">
              +{hidden.length}
              {hiddenHasError && (
                <span className="absolute -right-0.5 -top-0.5 flex size-3 items-center justify-center rounded-full bg-destructive text-white ring-2 ring-card">
                  <AlertTriangleIcon className="size-2" />
                </span>
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="mb-1 font-medium">{hidden.length} channel lainnya</p>
            <ul className="space-y-0.5">
              {hidden.map((c, i) => (
                <li
                  key={`${c.channelCode}-${i}`}
                  className={cn(
                    "flex items-center gap-1.5",
                    c.errorText && "text-destructive"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      c.errorText ? "bg-destructive" : "bg-emerald-500"
                    )}
                  />
                  {c.channelName} · {c.storeName}
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
