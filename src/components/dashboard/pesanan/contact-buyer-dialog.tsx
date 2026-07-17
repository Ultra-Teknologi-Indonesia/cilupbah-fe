"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

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
import {
  CONTACT_CHANNEL_LABELS,
  CUSTOMER_DECISION_LABELS,
  type ContactChannel,
  type CustomerDecision,
} from "@/types/pesanan/order";
import {
  useMarkContacted,
  useSetCustomerDecision,
} from "@/hooks/pesanan/use-order-actions";

interface ContactBuyerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNo: string;
  defaultChannel?: ContactChannel;
  defaultDecision?: CustomerDecision;
  defaultNote?: string;
  onSaved?: (decision: CustomerDecision | null) => void;
}

const CHANNEL_OPTIONS = Object.entries(CONTACT_CHANNEL_LABELS) as Array<
  [ContactChannel, string]
>;
const DECISION_OPTIONS = Object.entries(CUSTOMER_DECISION_LABELS) as Array<
  [CustomerDecision, string]
>;

export function ContactBuyerDialog({
  open,
  onOpenChange,
  orderId,
  orderNo,
  defaultChannel,
  defaultDecision,
  defaultNote,
  onSaved,
}: ContactBuyerDialogProps) {
  const [channel, setChannel] = React.useState<ContactChannel>(
    defaultChannel ?? "marketplace_chat",
  );
  const [includeDecision, setIncludeDecision] = React.useState(
    Boolean(defaultDecision),
  );
  const [decision, setDecision] = React.useState<CustomerDecision>(
    defaultDecision ?? "waiting",
  );
  const [note, setNote] = React.useState(defaultNote ?? "");

  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevDefaultChannel, setPrevDefaultChannel] = React.useState(defaultChannel);
  const [prevDefaultDecision, setPrevDefaultDecision] = React.useState(defaultDecision);
  const [prevDefaultNote, setPrevDefaultNote] = React.useState(defaultNote);
  if (
    open !== prevOpen ||
    defaultChannel !== prevDefaultChannel ||
    defaultDecision !== prevDefaultDecision ||
    defaultNote !== prevDefaultNote
  ) {
    setPrevOpen(open);
    setPrevDefaultChannel(defaultChannel);
    setPrevDefaultDecision(defaultDecision);
    setPrevDefaultNote(defaultNote);
    if (open) {
      setChannel(defaultChannel ?? "marketplace_chat");
      setIncludeDecision(Boolean(defaultDecision));
      setDecision(defaultDecision ?? "waiting");
      setNote(defaultNote ?? "");
    }
  }

  const markContacted = useMarkContacted();
  const setCustomerDecision = useSetCustomerDecision();
  const loading = markContacted.isPending || setCustomerDecision.isPending;

  const handleSubmit = async () => {
    await markContacted.mutateAsync({
      orderId,
      channel,
      note: note.trim() || undefined,
    });

    if (includeDecision) {
      await setCustomerDecision.mutateAsync({
        orderId,
        decision,
        note: note.trim() || undefined,
      });
    }

    onOpenChange(false);
    onSaved?.(includeDecision ? decision : null);
  };

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Catat Konfirmasi Pembeli</DialogTitle>
          <DialogDescription>
            Catat channel & keputusan pembeli untuk pesanan{" "}
            <span className="font-medium">{orderNo}</span>. Setelah tersimpan,
            sistem menandai pesanan sudah dihubungi supaya tidak di-chat ulang.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto py-2">
          <div className="grid gap-2">
            <Label>Channel Kontak</Label>
            <RadioGroup
              value={channel}
              onValueChange={(v) => setChannel(v as ContactChannel)}
              className="grid grid-cols-2 gap-2"
            >
              {CHANNEL_OPTIONS.map(([value, label]) => (
                <label
                  key={value}
                  htmlFor={`channel-${value}`}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-muted/40 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                >
                  <RadioGroupItem id={`channel-${value}`} value={value} />
                  {label}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={includeDecision}
                onChange={(e) => setIncludeDecision(e.target.checked)}
                className="size-4 rounded border-border/60"
              />
              Sekaligus catat keputusan pembeli
            </label>

            {includeDecision && (
              <RadioGroup
                value={decision}
                onValueChange={(v) => setDecision(v as CustomerDecision)}
                className="grid grid-cols-3 gap-2"
              >
                {DECISION_OPTIONS.map(([value, label]) => (
                  <label
                    key={value}
                    htmlFor={`decision-${value}`}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-muted/40 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                  >
                    <RadioGroupItem id={`decision-${value}`} value={value} />
                    {label}
                  </label>
                ))}
              </RadioGroup>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact-note">Catatan (opsional)</Label>
            <Textarea
              id="contact-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Detail hasil konfirmasi, mis. 'Buyer minta ganti warna hitam'"
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2Icon className="animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
