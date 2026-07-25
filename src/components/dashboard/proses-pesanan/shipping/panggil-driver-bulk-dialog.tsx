"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserSelectById } from "@/components/dashboard/shared/user-select-by-id";
import { useMe } from "@/hooks/auth/use-auth";
import { useUsers } from "@/hooks/pengaturan/use-users";
import { useCallInstantDriverBulk } from "@/hooks/proses-pesanan/use-driver-call";
import type { Shipment } from "@/types/proses-pesanan/fulfillment";

interface PanggilDriverBulkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipments: Shipment[];
  onSuccess?: () => void;
}

const SHIPPER_ROLES = [
  "Shipper",
  "Warehouse Staff",
  "Packer",
  "Fulfillment",
  "Admin",
];

export function PanggilDriverBulkDialog({
  open,
  onOpenChange,
  shipments,
  onSuccess,
}: PanggilDriverBulkDialogProps) {
  const [shipperId, setShipperId] = React.useState("");
  const { data: me } = useMe();
  const { data: usersData, isLoading: usersLoading } = useUsers({
    perPage: 50,
    "filter[role]": SHIPPER_ROLES,
  });
  const call = useCallInstantDriverBulk();

  const shipperOptions = React.useMemo(
    () =>
      (usersData?.items ?? []).map((u) => ({
        id: String(u.id),
        name: u.name ?? u.email ?? String(u.id),
        hint: u.roles?.join(", "),
      })),
    [usersData?.items],
  );

  React.useEffect(() => {
    if (!open) setShipperId("");
  }, [open]);

  const eligibleShipments = shipments.filter((s) => s.hasInstant);
  const skippedShipments = shipments.filter((s) => !s.hasInstant);

  const handleSubmit = async () => {
    if (!shipperId || eligibleShipments.length === 0) return;
    try {
      await call.mutateAsync({
        shipperId,
        shipmentIds: eligibleShipments.map((s) => s.id),
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {

    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Panggil Driver</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm">
            <span className="font-medium">{eligibleShipments.length}</span>{" "}
            pengiriman siap dipanggil
            {skippedShipments.length > 0 && (
              <span className="ml-1 text-warning">
                · {skippedShipments.length} dilewati (bukan kurir instan)
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="panggil-driver-shipper">Shipper</Label>
            <UserSelectById
              id="panggil-driver-shipper"
              value={shipperId}
              onChange={(id) => setShipperId(id)}
              options={shipperOptions}
              isLoading={usersLoading}
              currentUserId={me?.id ? String(me.id) : undefined}
              defaultToSelf
              placeholder="Pilih shipper (warehouse staff)…"
              emptyText="Tidak ada petugas."
            />
          </div>

          {eligibleShipments.length > 0 && (
            <div className="rounded-xl border border-border">
              <div className="border-b border-border/60 px-3 py-2 text-xs text-muted-foreground">
                Ringkasan pengiriman
              </div>
              <ul className="max-h-60 divide-y divide-border/60 overflow-y-auto text-sm">
                {eligibleShipments.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{s.shipmentNo}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.courierName ?? s.courierCode ?? "—"} ·{" "}
                        {s.ordersCount} pesanan
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              !shipperId ||
              eligibleShipments.length === 0 ||
              call.isPending
            }
          >
            {call.isPending && <Loader2Icon className="animate-spin" />}
            Kirim
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
