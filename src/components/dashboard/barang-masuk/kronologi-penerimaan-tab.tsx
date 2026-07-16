"use client";

import * as React from "react";
import { Loader2Icon, PackageIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function formatTanggal(iso: string): string {
  const d = new Date(iso);
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function formatJam(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
    <Table containerClassName="rounded-xl border border-border/40 bg-background/70">
      <TableHeader>
        <TableRow className="border-b border-border/60 bg-muted/30">
          <TableHead className="px-3 py-2 text-2xs uppercase tracking-wider text-muted-foreground">
            Tanggal
          </TableHead>
          <TableHead className="px-3 py-2 text-2xs uppercase tracking-wider text-muted-foreground">
            Jam
          </TableHead>
          <TableHead className="px-3 py-2 text-2xs uppercase tracking-wider text-muted-foreground">
            Oleh
          </TableHead>
          <TableHead className="px-3 py-2 text-right text-2xs uppercase tracking-wider text-muted-foreground">
            Qty
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const staffName = r.received_by_user?.name ?? "Staff dihapus";
          const damage = r.condition === "DAMAGE";
          const adjustment = r.condition === "ADJUSTMENT";
          const isNegative = r.qty < 0;
          const qtyClass = adjustment
            ? isNegative
              ? "text-destructive"
              : "text-success"
            : damage
              ? "text-destructive"
              : "text-foreground";
          const prefix = r.qty > 0 ? "+" : "";
          return (
            <TableRow
              key={r.id}
              className="border-b border-border/20 last:border-0"
            >
              <TableCell className="px-3 py-2 text-xs text-foreground">
                {formatTanggal(r.received_date)}
              </TableCell>
              <TableCell className="px-3 py-2 text-xs tabular-nums text-muted-foreground">
                {formatJam(r.received_date)}
              </TableCell>
              <TableCell className="px-3 py-2 text-xs text-foreground">
                <div className="flex flex-col">
                  <span>{staffName}</span>
                  {adjustment && (
                    <span className="text-2xs text-muted-foreground">
                      Koreksi qty
                    </span>
                  )}
                  {damage && (
                    <span className="text-2xs text-destructive">Rusak</span>
                  )}
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  "px-3 py-2 text-right text-xs font-semibold tabular-nums",
                  qtyClass,
                )}
              >
                {prefix}
                {r.qty}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
