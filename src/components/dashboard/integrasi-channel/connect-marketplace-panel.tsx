import { Loader2Icon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Channel, ChannelCode } from "@/types/channel"
import { ChannelLogo } from "./channel-logo"

export function ConnectMarketplacePanel({
  channels,
  onConnect,
  pendingCode,
}: {
  channels: Channel[]
  onConnect: (channel: Channel) => void
  pendingCode?: ChannelCode | null
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-medium">Hubungkan Marketplace Lain</h2>
        <p className="text-xs text-muted-foreground">
          Marketplace yang belum memiliki toko terhubung.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => {
          const connecting = pendingCode === channel.code
          return (
            <div
              key={channel.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
            >
              <ChannelLogo code={channel.code} name={channel.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{channel.name}</p>
                {channel.connectable ? (
                  <p className="text-xs text-muted-foreground">Belum terhubung</p>
                ) : (
                  <Badge
                    variant="outline"
                    className="mt-0.5 px-1.5 py-0 text-[10px] text-muted-foreground"
                  >
                    Segera hadir
                  </Badge>
                )}
              </div>
              <Button
                variant={channel.connectable ? "primary" : "outline"}
                size="sm"
                disabled={!channel.connectable || connecting}
                onClick={() => onConnect(channel)}
                aria-label={`Hubungkan ${channel.name}`}
                title={channel.connectable ? undefined : "Belum didukung"}
              >
                {connecting ? (
                  <Loader2Icon className="animate-spin motion-reduce:animate-none" />
                ) : (
                  <PlusIcon />
                )}
                Hubungkan
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
