"use client";

import * as React from "react";
import { Loader2Icon, PackageIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { useInboundReceipts } from "@/hooks/barang-masuk/use-inbound";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatFullDateTime(iso: string): string {
  const d = new Date(iso);
  const tanggal = `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${tanggal} · ${jam}`;
}

function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function KronologiPenerimaanItem({
  inboundId,
  itemId,
  enabled = true,
}: {
  inboundId: string;
  itemId: string;
  enabled?: boolean;
}) {
  const { data, isLoading } = useInboundReceipts(
    inboundId,
    {
      "filter[inbound_item_id]": itemId,
      per_page: 200,
      sort: "-received_date",
    },
    { enabled: enabled && !!itemId },
  );

  const rows = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex h-16 items-center justify-center">
        <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-6">
        <EmptyState
          title="Belum ada penerimaan"
          description="Setiap staff yang scan SKU ini akan muncul di sini."
          icon={PackageIcon}
        />
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {rows.map((r) => {
        const staffName = r.received_by_user?.name ?? "Staff dihapus";
        const damage = r.condition === "DAMAGE";
        return (
          <li
            key={r.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5",
            )}
          >
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-2xs font-semibold text-foreground"
              aria-hidden
            >
              {initials(staffName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{staffName}</p>
              <p className="text-2xs text-muted-foreground">
                {formatFullDateTime(r.received_date)}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums",
                damage
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary",
              )}
            >
              {damage ? "" : "+"}
              {r.qty}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
