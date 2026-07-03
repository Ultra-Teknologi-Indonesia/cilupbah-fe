"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/lib/format";
import { ImageIcon } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";

import type { RaiseProductDetail } from "@/hooks/master-produk/use-naikkan";

export const aktivitasColumns: ColumnDef<RaiseProductDetail>[] = [
  {
    id: "product",
    header: "Produk",
    cell: ({ row }) => {
      const d = row.original;
      const thumb = d.thumbnails.find(Boolean) ?? null;
      const skuDisplay =
        d.itemCodes.length <= 2
          ? d.itemCodes.join(", ")
          : `${d.itemCodes.slice(0, 2).join(", ")} + ${d.itemCodes.length - 2} SKU lainnya`;

      return (
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumb}
                alt={d.itemGroupName ?? ""}
                className="size-full object-cover"
              />
            ) : (
              <ImageIcon className="size-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 font-medium">{d.itemGroupName ?? "—"}</p>
            <p className="line-clamp-1 font-mono text-xs text-muted-foreground">
              {skuDisplay || "—"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "start_time",
    header: "Tgl. Naik",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatDateTime(row.original.startTime)}
      </span>
    ),
  },
  {
    id: "end_time",
    header: "Tgl. Turun",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatDateTime(row.original.endTime)}
      </span>
    ),
  },
  {
    id: "reason",
    header: "Keterangan",
    cell: ({ row }) => {
      const r = row.original;
      if (r.isSuccess === null)
        return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-2">
          <StatusBadge 
            domain="product-boost-activity" 
            status={r.isSuccess ? "SUCCESS" : "FAILED"} 
          />
          {r.reason && (
            <span
              className="line-clamp-1 text-xs text-muted-foreground"
              title={r.reason}
            >
              {r.reason}
            </span>
          )}
        </div>
      );
    },
  },
];
