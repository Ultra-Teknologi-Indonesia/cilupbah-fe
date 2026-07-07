"use client";

import * as React from "react";
import { BarcodeIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format";
import { buildPrintableLabels } from "@/lib/laporan/barcode-labels";
import type { BarcodeHarga, BarcodeLabel } from "@/types/laporan/barcode";
import { Barcode } from "@/components/dashboard/laporan/barcode/barcode";

interface BarcodeLabelGridProps {
  labels: BarcodeLabel[];
  harga: BarcodeHarga;
}

export function BarcodeLabelGrid({ labels, harga }: BarcodeLabelGridProps) {
  const printable = React.useMemo(
    () => buildPrintableLabels(labels, harga),
    [labels, harga],
  );

  if (printable.length === 0) {
    return (
      <EmptyState
        icon={BarcodeIcon}
        title="Belum ada label untuk ditampilkan"
        description="Pilih produk lalu klik Pratinjau untuk melihat label barcode."
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {printable.map((item) => (
        <div
          key={item.key}
          className="flex flex-col items-center justify-between gap-0.5 rounded-md border border-border px-2 py-2 text-center"
        >
          {harga === "online" ? (
            <div className="flex w-full items-center justify-between gap-1 text-2xs font-semibold">
              <span className="truncate">{item.storeName ?? "-"}</span>
              <span className="shrink-0 truncate font-mono">{item.sku}</span>
            </div>
          ) : (
            <div className="line-clamp-3 w-full text-2xs font-semibold leading-tight">
              {item.name}
            </div>
          )}

          <Barcode value={item.sku} className="my-1 h-10 w-full" />

          {harga !== "online" && (
            <div className="font-mono text-xs font-bold">{item.sku}</div>
          )}

          {item.price != null && (
            <div className="text-xs font-bold">
              {formatCurrency(item.price)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
