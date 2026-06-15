import { InfoIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Channel } from "@/types/channel"
import { ChannelLogo } from "./channel-logo"

export function ConnectMarketplacePanel({
  channels,
  connectedCounts = {},
}: {
  channels: Channel[]
  /** Jumlah toko terhubung per kode channel (boleh > 1 per channel). */
  connectedCounts?: Record<string, number>
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-medium">Hubungkan Marketplace Lain</h2>
        <p className="text-xs text-muted-foreground">
          Marketplace yang belum memiliki toko terhubung.
        </p>
      </div>

      {/* Jelaskan kenapa tombol nonaktif — agar tidak terkesan rusak. */}
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-foreground/80">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Integrasi OAuth sedang disiapkan. Tombol{" "}
          <span className="font-medium">Hubungkan</span> akan aktif untuk channel
          yang didukung setelah backend siap.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => {
          const count = connectedCounts[channel.code] ?? 0
          return (
            <div
              key={channel.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
            >
              <ChannelLogo code={channel.code} name={channel.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{channel.name}</p>
                {count > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {count} toko terhubung
                  </p>
                ) : channel.connectable ? (
                  <p className="text-xs text-muted-foreground">Menunggu integrasi</p>
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
                disabled
                aria-label={`Hubungkan ${channel.name}`}
                title={
                  channel.connectable
                    ? "Menunggu integrasi OAuth"
                    : "Belum didukung"
                }
              >
                <PlusIcon />
                {count > 0 ? "Tambah toko" : "Hubungkan"}
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
