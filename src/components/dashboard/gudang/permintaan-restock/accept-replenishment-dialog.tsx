"use client";

import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelectById } from "@/components/dashboard/shared/user-select-by-id";
import { useUserLookup } from "@/hooks/pengaturan/use-users";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAcceptReplenishment } from "@/hooks/gudang/use-stock-replenishment";
import type { StockReplenishment } from "@/types/gudang/stock-replenishment";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: StockReplenishment | null;
}

export function AcceptReplenishmentDialog({ open, onOpenChange, request }: Props) {
  const [assigneeId, setAssigneeId] = useState("");
  const [note, setNote] = useState("");
  const [search] = useState("");
  const debounced = useDebouncedValue(search, 250);

  const { data, isLoading } = useUserLookup({
    perPage: 30,
    search: debounced || undefined,
  });

  const options = useMemo(
    () =>
      (data?.items ?? []).map((u) => ({
        id: u.id,
        name: u.name,
        hint: u.email,
      })),
    [data],
  );

  const acceptMut = useAcceptReplenishment();

  function handleClose() {
    if (acceptMut.isPending) return;
    setAssigneeId("");
    setNote("");
    onOpenChange(false);
  }

  async function handleConfirm() {
    if (!request) return;
    await acceptMut.mutateAsync({
      id: request.id,
      payload: {
        assignee_user_id: assigneeId || null,
        note: note || null,
      },
    });
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : onOpenChange(v))}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Terima Permintaan Pengisian Stok</DialogTitle>
          <DialogDescription>
            Setelah diterima, sistem otomatis membuat Transfer Keluar DRAFT
            dari {request?.from_location_name ?? "Gudang Pusat"} ke{" "}
            {request?.to_location_name ?? "Gudang Kecil"} dan menugaskan staf
            yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
            <div className="mb-1 font-medium">Daftar Barang</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {(request?.items ?? []).map((it) => (
                <li key={it.id} className="flex items-center justify-between">
                  <span className="truncate">{it.sku}</span>
                  <span className="tabular-nums">{it.qty}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Assign Staff</Label>
            <UserSelectById
              value={assigneeId}
              onChange={(id) => setAssigneeId(id)}
              options={options}
              isLoading={isLoading}
              placeholder="Pilih staf"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Catatan (opsional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahan catatan untuk staf"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={acceptMut.isPending}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={acceptMut.isPending}>
            {acceptMut.isPending ? "Menyimpan…" : "Terima"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
