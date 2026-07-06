"use client";

import type { ReactNode } from "react";

import type { ProductDetail } from "@/types/master-produk";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value ?? "—"}</span>
    </div>
  );
}

const yn = (b: boolean) => (b ? "Ya" : "Tidak");

export function ShippingCard({ product }: { product: ProductDetail }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <h3 className="mb-2 text-sm font-semibold">Pengiriman</h3>
      <Row
        label="Berat"
        value={product.weight != null ? `${product.weight} kg` : "—"}
      />
      <Row label="Konsinyasi" value={yn(product.isConsignment)} />
    </div>
  );
}
