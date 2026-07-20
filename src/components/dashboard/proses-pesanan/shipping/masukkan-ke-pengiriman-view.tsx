"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, ScanBarcodeIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/dashboard/page-title";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useRemoveOrderFromShipment,
  useScanOrderToShipment,
  useShipmentOrdersPaginated,
  useShipments,
} from "@/hooks/proses-pesanan/use-fulfillment";
import { formatShipmentLabel } from "@/lib/proses-pesanan/shipment-type";
import { apiError } from "@/lib/toast";
import { ChannelBadge } from "../channel-badge";

export function MasukkanKePengirimanView() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from");
  const initialShipmentId = search.get("shipmentId") ?? "";

  const [shipmentId, setShipmentId] = React.useState(initialShipmentId);
  const [barcode, setBarcode] = React.useState("");
  const scanRef = React.useRef<HTMLInputElement>(null);

  const shipmentsList = useShipments({
    status: "SCHEDULED",
    per_page: 50,
  });
  const orders = useShipmentOrdersPaginated(
    shipmentId,
    { page: 1, per_page: 100 },
    !!shipmentId,
  );
  const scanOrder = useScanOrderToShipment();
  const removeOrder = useRemoveOrderFromShipment();

  const shipmentOptions = React.useMemo(
    () =>
      (shipmentsList.data?.items ?? []).map((s) => ({
        value: s.id,
        label: formatShipmentLabel(s),
      })),
    [shipmentsList.data?.items],
  );

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = barcode.trim();
    if (!value || !shipmentId) return;

    try {
      await scanOrder.mutateAsync({ shipmentId, barcode: value });
      toast.success(`Resi ${value} ditambahkan ke pengiriman.`);
      setBarcode("");
      scanRef.current?.focus();
    } catch (err) {
      apiError(err, "Gagal menambahkan pesanan ke pengiriman.");
    }
  };

  const handleRemove = async (orderId: string) => {
    if (!shipmentId) return;
    try {
      await removeOrder.mutateAsync({ shipmentId, orderIds: [orderId] });
      toast.success("Pesanan dihapus dari pengiriman.");
    } catch (err) {
      apiError(err, "Gagal menghapus pesanan dari pengiriman.");
    }
  };

  const backHref = from ?? "/dashboard/proses-pesanan/shipping";

  const handleBack = () => {
    router.push(backHref);
  };

  const items = orders.data?.items ?? [];

  return (
    <div className="space-y-5 pb-8">
      <PageTitle title="Masukkan ke Pengiriman" backHref={backHref} />

      <div className="rounded-4xl border border-border/60 bg-background/80 p-4 sm:p-5">
        <div className="space-y-1.5">
          <Label htmlFor="mkp-shipment">
            No. Pengiriman <span className="text-destructive">*</span>
          </Label>
          <Combobox
            id="mkp-shipment"
            options={shipmentOptions}
            value={shipmentId || null}
            onChange={(v) => setShipmentId(v ?? "")}
            placeholder="Pilih no. pengiriman…"
            searchPlaceholder="Cari no. pengiriman…"
            emptyText="Belum ada pengiriman terjadwal."
            loading={shipmentsList.isLoading}
          />
        </div>
      </div>

      <form
        onSubmit={handleScan}
        className="rounded-4xl border border-border/60 bg-background/80 p-4 sm:p-5"
      >
        <Label
          htmlFor="mkp-scan"
          className="mb-1.5 flex items-center gap-2 text-sm font-medium"
        >
          <ScanBarcodeIcon className="size-4 text-muted-foreground" />
          Scan No. Pesanan / No. Resi
        </Label>
        <div className="flex gap-2">
          <Input
            id="mkp-scan"
            ref={scanRef}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Masukkan No. Pesanan/No. Resi"
            disabled={!shipmentId || scanOrder.isPending}
            autoFocus
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!shipmentId || !barcode.trim() || scanOrder.isPending}
          >
            {scanOrder.isPending && <Loader2Icon className="animate-spin" />}
            Tambah
          </Button>
        </div>
        {!shipmentId && (
          <p className="mt-2 text-xs text-muted-foreground">
            Pilih No. Pengiriman terlebih dahulu untuk mulai scan.
          </p>
        )}
      </form>

      <div className="rounded-4xl border border-border/60 bg-background/80">
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3 sm:px-5">
          <p className="text-sm font-medium">
            Paket dalam pengiriman{" "}
            <span className="text-muted-foreground">({items.length})</span>
          </p>
        </div>
        {items.length === 0 ? (
          <EmptyState
            title={
              shipmentId
                ? "Belum ada pesanan"
                : "Pilih pengiriman untuk melihat isi"
            }
            description={
              shipmentId
                ? "Scan No. Pesanan / No. Resi di atas untuk menambahkan."
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Resi</TableHead>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="w-16 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">
                      {it.trackingNumber ?? "—"}
                    </TableCell>
                    <TableCell>{it.orderNo ?? "—"}</TableCell>
                    <TableCell>
                      <ChannelBadge source={it.source ?? null} />
                    </TableCell>
                    <TableCell>{it.customerName ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(it.orderId)}
                        disabled={removeOrder.isPending}
                        aria-label={`Hapus ${it.orderNo ?? it.trackingNumber ?? "pesanan"}`}
                      >
                        <Trash2Icon className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <p className="text-xs text-muted-foreground">
          Pengiriman ini masih terbuka dan bisa ditambah resi kapan saja. Tutup
          lewat tombol Selesaikan di daftar Jadwal Pengiriman.
        </p>
        <Button variant="outline" onClick={handleBack}>
          Tutup
        </Button>
      </div>
    </div>
  );
}
