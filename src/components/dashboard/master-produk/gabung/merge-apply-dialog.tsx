"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: { id: string; name: string }[];
  defaultMasterName: string;
  loading?: boolean;
  onConfirm: (masterName: string) => void;
}

export function MergeApplyDialog({
  open,
  onOpenChange,
  products,
  defaultMasterName,
  loading,
  onConfirm,
}: Props) {
  const [masterName, setMasterName] = React.useState(defaultMasterName);
  const [prevOpen, setPrevOpen] = React.useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMasterName(defaultMasterName);
  }

  const trimmed = masterName.trim();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Gabungkan produk"
      description={`${products.length} produk akan tampil sebagai satu produk master.`}
      confirmLabel="Gabungkan"
      loading={loading}
      confirmDisabled={trimmed === "" || products.length < 2}
      onConfirm={() => onConfirm(trimmed)}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="merge-master-name" className="text-sm font-medium">
            Nama master
          </label>
          <Input
            id="merge-master-name"
            value={masterName}
            onChange={(e) => setMasterName(e.target.value)}
            placeholder="Nama produk master"
          />
          <p className="text-xs text-muted-foreground">
            Nama ini menjadi identitas produk gabungan di katalog.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            Produk yang digabung ({products.length})
          </p>
          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border bg-muted/40 p-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="truncate rounded-xl px-2 py-1 text-sm text-foreground"
                title={p.name}
              >
                {p.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ConfirmDialog>
  );
}
