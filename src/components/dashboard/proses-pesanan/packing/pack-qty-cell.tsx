"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { PacklistItem } from "@/types/proses-pesanan/fulfillment";

/**
 * Editable "QTY Pack" cell for the manual bulk path: the checker types an
 * absolute qty and Enter/blur commits it. Scan-to-increment updates
 * `item.qtyPacked` externally; the draft re-syncs whenever the field is not
 * being edited.
 */
export function PackQtyCell({
  item,
  onCommit,
  disabled,
}: {
  item: PacklistItem;
  onCommit: (qty: number) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = React.useState(String(item.qtyPacked));
  const [editing, setEditing] = React.useState(false);
  const [syncedQty, setSyncedQty] = React.useState(item.qtyPacked);
  const done = item.qtyPacked >= item.qtyOrdered;

  // Re-sync the draft to the committed qty (scan +1, server refetch) during
  // render — but never while the checker is typing. See "You Might Not Need an
  // Effect" (react.dev). Avoids the set-state-in-effect cascade.
  if (item.qtyPacked !== syncedQty) {
    setSyncedQty(item.qtyPacked);
    if (!editing) setDraft(String(item.qtyPacked));
  }

  const commit = () => {
    const n = Number.parseInt(draft, 10);
    if (Number.isNaN(n)) {
      setDraft(String(item.qtyPacked));
      return;
    }
    const clamped = Math.max(0, Math.min(item.qtyOrdered, n));
    setDraft(String(clamped));
    onCommit(clamped);
  };

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={0}
      max={item.qtyOrdered}
      value={draft}
      disabled={disabled}
      onFocus={(e) => {
        setEditing(true);
        e.currentTarget.select();
      }}
      onBlur={() => {
        setEditing(false);
        commit();
      }}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      aria-label={`Qty pack ${item.sku}`}
      className={cn(
        "mx-auto h-9 w-20 text-center tabular-nums",
        done && "border-success/50 text-success",
      )}
    />
  );
}
