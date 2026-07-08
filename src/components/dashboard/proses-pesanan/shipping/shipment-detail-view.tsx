"use client";

import * as React from "react";
import {
  Loader2Icon,
  PackageIcon,
  PrinterIcon,
  ScanBarcodeIcon,
  SearchIcon,
  Trash2Icon,
  TruckIcon,
  WeightIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PageTitle } from "@/components/dashboard/page-title";
import { SimplePagination } from "@/components/ui/simple-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useShipmentDetail,
  useShipmentOrdersPaginated,
  useScanOrderToShipment,
  useRemoveOrderFromShipment,
} from "@/hooks/proses-pesanan/use-fulfillment";
import { playScanFeedback } from "@/lib/scan-feedback";
import { ChannelBadge } from "../channel-badge";
import { DocActions } from "../picking/doc-actions";
import { DeleteOrderDialog } from "../shared/delete-order-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const LIST_HREF = "/dashboard/proses-pesanan";

function formatWeight(gram: number): string {
  if (!gram) return "0 g";
  const kg = gram / 1000;
  return kg < 1
    ? `${gram} g`
    : `${kg.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
}

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}

const PICKUP_LABEL: Record<string, { label: string; className: string }> = {
  success: { label: "Sudah", className: "bg-success/10 text-success" },
  pending: { label: "Proses", className: "bg-warning/10 text-warning" },
  failed: { label: "Gagal", className: "bg-destructive/10 text-destructive" },
  skipped: { label: "Manual", className: "bg-muted text-muted-foreground" },
};

function PickupBadge({
  status,
  message,
}: {
  status: string | null;
  message: string | null;
}) {
  if (!status) return <span className="text-xs text-muted-foreground">—</span>;
  const cfg = PICKUP_LABEL[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge
      variant="secondary"
      className={cn("text-2xs px-1.5 py-0", cfg.className)}
      title={message ?? undefined}
    >
      {cfg.label}
    </Badge>
  );
}

export function ShipmentDetailView({ id }: { id: string }) {
  const [barcode, setBarcode] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [removeTarget, setRemoveTarget] = React.useState<{
    orderId: string;
    orderNo: string | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    orderId: string;
    orderNo: string | null;
  } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);
  const debouncedSearch = useDebouncedValue(searchQuery, 400);

  const { data: detail, isLoading } = useShipmentDetail(id, !!id);
  const { data: ordersData, isFetching: isFetchingOrders } = useShipmentOrdersPaginated(
    id,
    { page, per_page: perPage, q: debouncedSearch },
    !!id
  );
  
  const scanOrder = useScanOrderToShipment();
  const removeOrder = useRemoveOrderFromShipment();

  React.useEffect(() => {
    if (!isLoading && detail) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLoading, detail]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleScan = async () => {
    const code = barcode.trim();
    if (!code) return;

    try {
      await scanOrder.mutateAsync({ shipmentId: id, barcode: code });
      playScanFeedback("ok");
      toast.success(`Pesanan ${code} ditambahkan.`);
      setBarcode("");
      inputRef.current?.focus();
    } catch (err) {
      playScanFeedback("error");
      toast.error(errMsg(err, "Gagal menambahkan pesanan."));
      setBarcode("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan();
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;

    try {
      await removeOrder.mutateAsync({
        shipmentId: id,
        orderIds: [removeTarget.orderId],
      });
      toast.success(
        `Pesanan ${removeTarget.orderNo ?? ""} dihapus dari pengiriman.`,
      );
    } catch (err) {
      toast.error(errMsg(err, "Gagal menghapus pesanan."));
    } finally {
      setRemoveTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="py-32 text-center text-sm text-muted-foreground">
        Pengiriman tidak ditemukan.
      </div>
    );
  }

  const filteredOrders = ordersData?.items ?? [];
  const meta = ordersData?.meta;

  const isScheduled = detail.status === "SCHEDULED";
  const withResi = detail.orders.filter((o) => !!o.trackingNumber).length;
  const withoutResi = detail.orders.length - withResi;
  const totalWeight = detail.orders.reduce((sum, o) => sum + o.weightGram, 0);

  return (
    <div className="space-y-5">
      <PageTitle
        title={detail.shipmentNo}
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Proses Pesanan", href: LIST_HREF },
          { label: "Jadwal Pengiriman", href: LIST_HREF },
          { label: detail.shipmentNo },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => DocActions.manifest(id)}
          >
            <PrinterIcon className="size-4 mr-1.5" />
            Cetak Manifest
          </Button>
        }
      />

      {}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 px-1">
        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="bg-white/40 dark:bg-white/[0.06]"
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TruckIcon className="size-3.5" />
              Kurir
            </div>
            <p className="text-sm font-semibold">{detail.courierName ?? "—"}</p>
          </div>
        </LiquidGlass>

        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="bg-white/40 dark:bg-white/[0.06]"
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <PackageIcon className="size-3.5" />
              Total Paket
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-semibold tabular-nums">
                {detail.orders.length}
              </p>
              <span className="text-xs text-muted-foreground">
                ({withResi} resi, {withoutResi} tanpa)
              </span>
            </div>
          </div>
        </LiquidGlass>

        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="bg-white/40 dark:bg-white/[0.06]"
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <WeightIcon className="size-3.5" />
              Total Berat
            </div>
            <p className="text-sm font-semibold tabular-nums">
              {formatWeight(totalWeight)}
            </p>
          </div>
        </LiquidGlass>

        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="bg-white/40 dark:bg-white/[0.06]"
        >
          <div className="px-4 py-3">
            <div className="text-xs text-muted-foreground mb-1">Tipe</div>
            <p className="text-sm font-semibold">
              {detail.shipmentType ?? "—"}
            </p>
          </div>
        </LiquidGlass>
      </div>

      {}
      {isScheduled && (
        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="bg-white/40 dark:bg-white/[0.06]"
        >
          <div className="px-4 py-4 sm:px-5">
            <p className="text-sm font-medium mb-2">Scan Pesanan</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ScanBarcodeIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Scan No. Pesanan / No. Resi…"
                  className="pl-9"
                  disabled={scanOrder.isPending}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleScan}
                disabled={!barcode.trim() || scanOrder.isPending}
              >
                {scanOrder.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Tambah"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Pesanan harus berstatus packed dan menggunakan kurir yang sama.
            </p>
          </div>
        </LiquidGlass>
      )}

      {}
      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="px-4 py-4 sm:px-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Daftar Pesanan</p>
              <Badge>{meta?.total ?? 0}</Badge>
            </div>

            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari No. Pesanan / Resi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>

          <ScrollArea className="rounded-lg border border-border">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10 text-center">No</TableHead>
                    <TableHead>No. Pesanan</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>No. Resi</TableHead>
                    <TableHead className="text-center">Status Ambil</TableHead>
                    <TableHead className="text-right">Berat</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    {isScheduled && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isScheduled ? 8 : 7}
                        className="py-16 text-center text-sm text-muted-foreground"
                      >
                        {searchQuery.trim()
                          ? "Pesanan tidak ditemukan."
                          : "Belum ada pesanan. Scan untuk menambahkan."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((o, idx) => (
                      <TableRow key={o.id}>
                        <TableCell className="text-center text-xs text-muted-foreground tabular-nums">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {o.source && <ChannelBadge source={o.source} />}
                            <span className="font-medium text-foreground text-xs">
                              {o.orderNo ?? "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {o.customerName ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-xs tabular-nums",
                              o.trackingNumber
                                ? "text-foreground"
                                : "text-muted-foreground italic",
                            )}
                          >
                            {o.trackingNumber ?? "Belum ada"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <PickupBadge
                            status={o.pickupStatus}
                            message={o.pickupMessage}
                          />
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {formatWeight(o.weightGram)}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {o.grandTotal.toLocaleString("id-ID")}
                        </TableCell>
                        {isScheduled && (
                          <TableCell>
                            <div className="flex items-center justify-end gap-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setRemoveTarget({
                                    orderId: o.orderId,
                                    orderNo: o.orderNo,
                                  })
                                }
                                disabled={removeOrder.isPending}
                                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                aria-label="Keluarkan dari pengiriman"
                                title="Keluarkan dari pengiriman"
                              >
                                <XCircleIcon className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({
                                    orderId: o.orderId,
                                    orderNo: o.orderNo,
                                  })
                                }
                                className="rounded-md p-1 text-destructive transition-colors hover:bg-destructive/10"
                                aria-label="Hapus Pesanan"
                                title="Hapus Pesanan (kembalikan ke tahap sebelumnya)"
                              >
                                <Trash2Icon className="size-3.5" />
                              </button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {meta && (
              <div className="p-4 border-t border-border bg-muted/20">
                <SimplePagination
                  page={meta.current_page}
                  lastPage={meta.last_page}
                  perPage={meta.per_page}
                  total={meta.total}
                  isFetching={isFetchingOrders}
                  onPageChange={setPage}
                  onPerPageChange={setPerPage}
                  label="pesanan"
                />
              </div>
            )}
          </ScrollArea>
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => {
          if (!o) setRemoveTarget(null);
        }}
        title="Hapus Pesanan"
        description={`Hapus pesanan ${
          removeTarget?.orderNo ?? removeTarget?.orderId ?? ""
        } dari pengiriman ini?`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={removeOrder.isPending}
        onConfirm={handleRemove}
      />

      <DeleteOrderDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        orderId={deleteTarget?.orderId ?? null}
        orderNo={deleteTarget?.orderNo ?? null}
      />
    </div>
  );
}
