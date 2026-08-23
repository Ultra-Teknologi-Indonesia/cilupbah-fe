"use client";

import * as React from "react";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";

import { apiError } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useFailPickItem } from "@/hooks/proses-pesanan/use-fulfillment";
import {
  FAIL_REASON_LABEL,
  type PicklistFailReasonCode,
  type PicklistItem,
} from "@/types/proses-pesanan/fulfillment";

const REASONS: PicklistFailReasonCode[] = [
  "STOCK_EMPTY",
  "DAMAGED",
  "MISSING",
  "OTHER",
];

export function FailItemDialog({
  open,
  onOpenChange,
  picklistId,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  picklistId: string;
  item: PicklistItem;
}) {
  const [reasonCode, setReasonCode] =
    React.useState<PicklistFailReasonCode>("STOCK_EMPTY");
  const [note, setNote] = React.useState("");
  const failItem = useFailPickItem();

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setReasonCode("STOCK_EMPTY");
      setNote("");
    }
  }

  const remaining = Math.max(0, item.qtyOrdered - item.qtyPicked);
  const requiresNote = reasonCode === "OTHER";
  const trimmedNote = note.trim();
  const noteValid = !requiresNote || trimmedNote.length >= 5;
  const canConfirm = noteValid && !failItem.isPending;

  const handleConfirm = () => {
    if (!canConfirm) return;
    failItem.mutate(
      {
        picklistId,
        itemId: item.id,
        reasonCode,
        reasonNote: trimmedNote || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (e) => {
          apiError(e, "Gagal menandai item gagal.");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!failItem.isPending) onOpenChange(v);
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="size-4 text-destructive" />
            Tandai Item Gagal
          </DialogTitle>
          <DialogDescription>
            Pilih alasan mengapa item ini tidak bisa dipenuhi. Item yang
            ditandai gagal tidak masuk packing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="font-medium text-foreground">
              {item.name ?? item.sku}
            </div>
            <div className="mt-0.5 font-mono text-xs text-muted-foreground">
              {item.sku}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Sisa{" "}
              <span className="font-semibold text-foreground">{remaining}</span>{" "}
              unit akan ditandai gagal & tidak masuk packing.
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Alasan</Label>
            <RadioGroup
              value={reasonCode}
              onValueChange={(v) => setReasonCode(v as PicklistFailReasonCode)}
              className="grid gap-2"
            >
              {REASONS.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-muted/40"
                >
                  <RadioGroupItem value={r} id={`reason-${r}`} />
                  <span className="text-foreground">
                    {FAIL_REASON_LABEL[r]}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fail-note" className="text-sm font-medium">
              Catatan {requiresNote ? "(wajib)" : "(opsional)"}
            </Label>
            <Textarea
              id="fail-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                requiresNote
                  ? "Jelaskan alasan spesifik (min 5 karakter)"
                  : "Catatan tambahan…"
              }
              maxLength={500}
              rows={3}
              disabled={failItem.isPending}
            />
            {requiresNote && !noteValid && trimmedNote.length > 0 && (
              <p className="text-xs text-destructive">
                Catatan minimal 5 karakter.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={failItem.isPending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {failItem.isPending && (
              <Loader2Icon className="size-4 animate-spin" />
            )}
            Ya, Tandai Gagal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
