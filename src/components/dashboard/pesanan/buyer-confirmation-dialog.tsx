"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
  useDecideBuyerConfirmation,
  useReplacementSkuSearch,
} from "@/hooks/pesanan/use-direct-completion";
import type {
  BuyerConfirmation,
  BuyerConfirmationOutcome,
} from "@/types/pesanan/direct-completion";

const OUTCOMES: Array<{
  value: BuyerConfirmationOutcome;
  label: string;
  hint: string;
}> = [
  {
    value: "WAIT",
    label: "Menunggu stok",
    hint: "Pesanan ditahan sampai stok masuk Gudang Kecil dari Gudang Pusat.",
  },
  {
    value: "REPLACE",
    label: "Ganti SKU",
    hint: "Ganti dengan SKU lain yang stoknya ada di Gudang Kecil.",
  },
  {
    value: "REMOVE",
    label: "Hapus SKU",
    hint: "Keluarkan baris ini dari pesanan. Tidak dikirim ke marketplace.",
  },
  {
    value: "CANCEL",
    label: "Batalkan pesanan",
    hint: "Batalkan seluruh pesanan. Tercatat di sistem saja.",
  },
];

export function BuyerConfirmationDialog({
  open,
  onOpenChange,
  confirmation,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmation: BuyerConfirmation | null;
  onDone?: () => void;
}) {
  if (!confirmation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembeli</DialogTitle>
          <DialogDescription>
            {confirmation.sku ?? "SKU"} kurang {confirmation.qty_short} pcs di
            Gudang Kecil pada pesanan {confirmation.salesorder_no ?? "-"}. Catat
            hasil konfirmasi ke pembeli.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <BuyerConfirmationBody
            key={confirmation.id}
            confirmation={confirmation}
            onClose={() => onOpenChange(false)}
            onDone={onDone}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function BuyerConfirmationBody({
  confirmation,
  onClose,
  onDone,
}: {
  confirmation: BuyerConfirmation;
  onClose: () => void;
  onDone?: () => void;
}) {
  const decide = useDecideBuyerConfirmation();

  const [outcome, setOutcome] = useState<BuyerConfirmationOutcome>("WAIT");
  const [replacementSku, setReplacementSku] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");

  const search = useReplacementSkuSearch(query, outcome === "REPLACE");

  const canSubmit = outcome !== "REPLACE" || Boolean(replacementSku);

  const submit = () => {
    decide.mutate(
      {
        confirmationId: confirmation.id,
        outcome,
        replacementSku: replacementSku ?? undefined,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          onDone?.();
        },
      },
    );
  };

  return (
    <>
      <div className="space-y-4">
        <RadioGroup
          value={outcome}
          onValueChange={(value) =>
            setOutcome(value as BuyerConfirmationOutcome)
          }
          className="gap-2"
        >
          {OUTCOMES.map((option) => (
            <label
              key={option.value}
              htmlFor={`outcome-${option.value}`}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/50"
            >
              <RadioGroupItem
                id={`outcome-${option.value}`}
                value={option.value}
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {option.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </RadioGroup>

        {outcome === "REPLACE" && (
          <div className="space-y-1.5">
            <Label htmlFor="replacement-sku">SKU pengganti</Label>
            <Combobox
              id="replacement-sku"
              options={search.data ?? []}
              value={replacementSku}
              onChange={setReplacementSku}
              onQueryChange={setQuery}
              loading={search.isFetching}
              placeholder="Cari SKU pengganti"
              searchPlaceholder="Ketik SKU atau nama produk"
              emptyText="SKU tidak ditemukan"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="confirmation-note">Catatan</Label>
          <Textarea
            id="confirmation-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Hasil percakapan dengan pembeli"
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button onClick={submit} disabled={!canSubmit || decide.isPending}>
          {decide.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Simpan Keputusan
        </Button>
      </DialogFooter>
    </>
  );
}
