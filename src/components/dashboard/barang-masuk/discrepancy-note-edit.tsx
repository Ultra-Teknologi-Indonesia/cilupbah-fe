"use client";

import * as React from "react";
import { Loader2Icon, PencilIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function DiscrepancyNoteEdit({
  note,
  productName,
  disabled = false,
  saving = false,
  onSave,
}: {
  note: string | null;
  productName?: string;
  disabled?: boolean;
  saving?: boolean;
  onSave: (note: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");

  const start = () => {
    if (disabled) return;
    setText(note ?? "");
    setOpen(true);
  };

  const commit = () => {
    const next = text.trim();
    if (next !== (note ?? "").trim()) onSave(next);
    setOpen(false);
  };

  return (
    <>
      {note ? (
        <button
          type="button"
          onClick={start}
          disabled={disabled}
          title={disabled ? undefined : "Klik untuk mengubah catatan"}
          className={cn(
            "group inline-flex max-w-[220px] items-start gap-1 rounded-full px-1.5 py-0.5 text-left text-xs text-foreground transition-colors",
            disabled
              ? "cursor-default"
              : "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          )}
        >
          <span className="whitespace-normal break-words">{note}</span>
          {!disabled && (
            <PencilIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={start}
          disabled={disabled}
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
        >
          <PlusIcon className="size-3.5" />
          Tambah catatan
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catatan penerimaan</DialogTitle>
            {productName && (
              <DialogDescription>{productName}</DialogDescription>
            )}
          </DialogHeader>
          <Textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Contoh: 1 pcs ditolak karena tidak sesuai / rusak."
            maxLength={1000}
            rows={4}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                commit();
              }
            }}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="button" size="sm" onClick={commit} disabled={saving}>
              {saving && <Loader2Icon className="mr-1.5 size-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
