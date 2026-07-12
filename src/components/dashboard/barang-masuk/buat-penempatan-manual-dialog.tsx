"use client";

import { useState, useMemo } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { useUsers } from "@/hooks/pengaturan/use-users";
import { fetchClient } from "@/lib/api-client";
import { toast } from "sonner";
import { apiError } from "@/lib/toast";
import type { Inbound } from "@/types/barang-masuk/inbound";

interface BuatPenempatanManualDialogProps {
  inbounds: Inbound[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Dipanggil setelah dokumen berhasil dibuat (mis. untuk mereset seleksi tabel
   * atau navigasi ke proses penempatan). `data` adalah payload putaway dari BE.
   */
  onSuccess?: (data?: unknown) => void;
}

export function BuatPenempatanManualDialog({
  inbounds,
  open,
  onOpenChange,
  onSuccess,
}: BuatPenempatanManualDialogProps) {
  const queryClient = useQueryClient();
  const { data: usersData, isLoading: usersLoading } = useUsers({
    perPage: 100,
    "filter[role]": "putaway",
  });
  const [assignedTo, setAssignedTo] = useState("");

  const { totalSku, totalQty } = useMemo(() => {
    const skuSet = new Set<string>();
    let qty = 0;
    for (const inbound of inbounds) {
      for (const item of inbound.items ?? []) {
        skuSet.add(item.item_id);
        qty += item.received_qty;
      }
    }
    return { totalSku: skuSet.size, totalQty: qty };
  }, [inbounds]);

  const userOptions = (usersData?.items ?? []).map((u) => ({
    value: u.id,
    label: `${u.name}`,
  }));

  const mutation = useMutation({
    mutationFn: async () => {
      if (inbounds.length === 0) throw new Error("Pilih minimal 1 penerimaan");
      const res = await fetchClient<{ data: unknown; error?: string }>(
        `/putaway`,
        {
          method: "POST",
          data: {
            inbound_ids: inbounds.map((i) => i.id),
            assigned_to: assignedTo || undefined,
          },
        },
      );
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Dokumen penempatan berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["putaways"] });
      queryClient.invalidateQueries({ queryKey: ["inbounds"] });
      queryClient.invalidateQueries({ queryKey: ["inbound"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
      onOpenChange(false);
      setAssignedTo("");
      onSuccess?.(data);
    },
    onError: (error) => {
      apiError(error, "Gagal membuat penempatan");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {inbounds.length > 1
              ? `Penempatan Gabungan (${inbounds.length} penerimaan)`
              : "Penempatan Manual"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Penerimaan
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {inbounds.map((i) => (
                <Badge key={i.id} variant="secondary">
                  {i.transaction_number}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <Label className="text-sm font-medium text-muted-foreground">
              Total SKU
            </Label>
            <Input
              value={totalSku}
              disabled
              className="bg-white/50 dark:bg-white/[0.02]"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <Label className="text-sm font-medium text-muted-foreground">
              Total Qty
            </Label>
            <Input
              value={totalQty}
              disabled
              className="bg-white/50 dark:bg-white/[0.02]"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <Label className="text-sm font-medium text-muted-foreground">
              Tugaskan Ke
            </Label>
            <Combobox
              options={userOptions}
              value={assignedTo}
              onChange={(v) => setAssignedTo(v ?? "")}
              placeholder={usersLoading ? "Memuat..." : "Pilih pengguna..."}
              searchPlaceholder="Cari pengguna..."
              className="w-full"
              disabled={usersLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !assignedTo || inbounds.length === 0}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {mutation.isPending && (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            )}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
