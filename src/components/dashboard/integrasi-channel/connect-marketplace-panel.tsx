import { InfoIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Channel } from "@/types/channel"
import { ChannelLogo } from "./channel-logo"

export function ConnectMarketplacePanel({ channels }: { channels: Channel[] }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-medium">Hubungkan Toko</h2>
        <p className="text-xs text-muted-foreground">
          Pilih marketplace untuk menghubungkan akun toko Anda.
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
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
          >
            <ChannelLogo code={channel.code} name={channel.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{channel.name}</p>
              {channel.connectable ? (
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
              Hubungkan
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
