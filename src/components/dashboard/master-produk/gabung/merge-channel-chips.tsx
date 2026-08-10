import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MergeChannel } from "@/types/product-merge";

const CHANNEL_BG: Record<string, string> = {
  shopee: "bg-[#EE4D2D]",
  tokopedia: "bg-[#03AC0E]",
  tiktok: "bg-neutral-900",
  lazada: "bg-[#0F146D]",
};

function ChannelDot({ channel }: { channel: MergeChannel }) {
  const code = channel.channel_code ?? "";
  const bg = CHANNEL_BG[code];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full ring-2 ring-card",
            bg ?? "bg-muted-foreground",
          )}
        >
          {bg ? (
            <span
              className="size-3.5 bg-white"
              style={{
                mask: `url(/channels/${code}.svg) center / contain no-repeat`,
                WebkitMask: `url(/channels/${code}.svg) center / contain no-repeat`,
              }}
            />
          ) : (
            <span className="text-2xs font-semibold text-white">
              {(channel.channel_name ?? channel.shop_name).charAt(0).toUpperCase()}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">
          {channel.channel_name ?? "Channel"} · {channel.shop_name}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export function MergeChannelChips({
  channels,
  max = 5,
}: {
  channels: MergeChannel[];
  max?: number;
}) {
  if (channels.length === 0) {
    return <span className="text-xs text-muted-foreground">Tanpa channel</span>;
  }

  const shown = channels.slice(0, max);
  const rest = channels.length - shown.length;

  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((c) => (
        <ChannelDot key={c.channel_shop_id} channel={c} />
      ))}
      {rest > 0 && (
        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-2xs font-semibold text-muted-foreground ring-2 ring-card">
          +{rest}
        </span>
      )}
    </div>
  );
}
