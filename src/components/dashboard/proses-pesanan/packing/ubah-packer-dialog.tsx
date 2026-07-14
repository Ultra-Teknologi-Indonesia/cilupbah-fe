"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { UserSelectById } from "@/components/dashboard/shared/user-select-by-id";
import { useMe } from "@/hooks/auth/use-auth";
import {
  useAssignPacker,
  usePickers,
} from "@/hooks/proses-pesanan/use-fulfillment";

interface UbahPackerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packlistId: string | null;
  packlistNo: string | null;
  locationId: string | null;
  currentPackerId: string | null;
}

export function UbahPackerDialog({
  open,
  onOpenChange,
  packlistId,
  packlistNo,
  locationId,
  currentPackerId,
}: UbahPackerDialogProps) {
  const [packerId, setPackerId] = React.useState("");

  const pickers = usePickers(locationId ?? undefined, "packer", open);
  const { data: me } = useMe();
  const assignPacker = useAssignPacker();

  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevCurrent, setPrevCurrent] = React.useState(currentPackerId);
  if (open !== prevOpen || currentPackerId !== prevCurrent) {
    setPrevOpen(open);
    setPrevCurrent(currentPackerId);
    if (open) setPackerId(currentPackerId ?? "");
  }

  const packerOptions = React.useMemo(
    () =>
      (pickers.data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
      })),
    [pickers.data],
  );

  const handleSubmit = async () => {
    if (!packlistId || !packerId) return;
    try {
      await assignPacker.mutateAsync({ packlistId, packerId });
      toast.success(`Packer untuk ${packlistNo ?? "packlist"} diperbarui.`);
      onOpenChange(false);
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal mengubah packer.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Packer</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {packlistNo && (
            <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm">
              Packlist <span className="font-medium">{packlistNo}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="assign-packer">Packer</Label>
            <UserSelectById
              id="assign-packer"
              value={packerId}
              onChange={(id) => setPackerId(id)}
              options={packerOptions}
              isLoading={pickers.isLoading}
              currentUserId={me?.id}
              placeholder="— Pilih packer —"
              emptyText="Tidak ada packer di lokasi ini."
            />
            {pickers.isLoading && (
              <p className="text-xs text-muted-foreground">
                Memuat daftar packer…
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!packerId || assignPacker.isPending}
          >
            {assignPacker.isPending && <Loader2Icon className="animate-spin" />}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
