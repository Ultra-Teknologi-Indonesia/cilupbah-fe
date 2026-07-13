"use client";

import { PrinterIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FulfillmentBulkActionBarProps {
  selectedCount: number;
  onReset: () => void;
  onPrintLabel: () => void;
  onPrintInvoice?: () => void;
  onPrintInvoiceAndLabel?: () => void;
  printLabelDisabled?: string;
  printInvoiceDisabled?: string;
}

export function FulfillmentBulkActionBar({
  selectedCount,
  onReset,
  onPrintLabel,
  onPrintInvoice,
  onPrintInvoiceAndLabel,
  printLabelDisabled,
  printInvoiceDisabled,
}: FulfillmentBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-full border border-border/60 bg-background/95 px-3 py-1.5 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Reset pilihan"
      >
        <Trash2Icon className="size-4" />
      </button>

      <span className="text-sm font-medium text-foreground">
        {selectedCount} Pesanan terpilih
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          onClick={onPrintLabel}
          disabled={!!printLabelDisabled}
          title={printLabelDisabled}
          className="rounded-full"
        >
          <PrinterIcon className="size-4" />
          Cetak Label Pengiriman
        </Button>

        {onPrintInvoice && (
          <Button
            size="sm"
            variant="outline"
            onClick={onPrintInvoice}
            disabled={!!printInvoiceDisabled}
            title={printInvoiceDisabled}
            className="rounded-full"
          >
            Cetak Faktur
          </Button>
        )}

        {onPrintInvoiceAndLabel && (
          <Button
            size="sm"
            variant="outline"
            onClick={onPrintInvoiceAndLabel}
            className="rounded-full"
          >
            Faktur & Label
          </Button>
        )}
      </div>
    </div>
  );
}
