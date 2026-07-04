"use client";

import * as React from "react";
import { format } from "date-fns";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-picker";
import {
  useCouriers,
  useCreateShipment,
} from "@/hooks/proses-pesanan/use-fulfillment";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import {
  SHIPMENT_TYPES,
  type ShipmentType,
} from "@/types/proses-pesanan/fulfillment";
import { PrinterIcon } from "lucide-react";
import { isShopeeInstantOrSameDay } from "@/lib/proses-pesanan/shopee";
import { usePrintWithDriverCall } from "@/hooks/proses-pesanan/use-driver-call";
import { DriverCallIndicator } from "@/components/dashboard/proses-pesanan/shared/driver-call-indicator";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const MARKETPLACE_SOURCES = ["shopee", "tiktok", "lazada", "tokopedia"];

interface BuatPengirimanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /**
   * Mode pesanan: buat pengiriman untuk pesanan terpilih.
   * Tanpa `orderIds`, dialog berjalan dalam mode standalone
   * (buat pengiriman kosong: no. pengiriman manual + pilih lokasi).
   */
  orderIds?: string[];
  locationId?: string | null;
  locationName?: string | null;
  multiLocation?: boolean;
  onCreated?: () => void;

  marketplaceSource?: string | null;

  shippingProvider?: string | null;

  shippingType?: string | null;
}

export function BuatPengirimanDialog({
  open,
  onOpenChange,
  ...formProps
}: BuatPengirimanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Pengiriman</DialogTitle>
          <DialogClose />
        </DialogHeader>
        {/* Form di-mount ulang tiap dialog dibuka (Radix meng-unmount konten
            saat tertutup), jadi state selalu fresh tanpa efek reset. */}
        <PengirimanForm onOpenChange={onOpenChange} {...formProps} />
      </DialogContent>
    </Dialog>
  );
}

function PengirimanForm({
  onOpenChange,
  orderIds,
  locationId,
  locationName,
  multiLocation = false,
  onCreated,
  marketplaceSource,
  shippingProvider,
  shippingType,
}: Omit<BuatPengirimanDialogProps, "open">) {
  const orderMode = orderIds !== undefined;
  const showDriverCall =
    orderMode &&
    (orderIds?.length ?? 0) > 0 &&
    isShopeeInstantOrSameDay({
      source: marketplaceSource,
      shippingProvider,
      shippingType,
    });

  const printWithDriverCall = usePrintWithDriverCall();
  const [driverCallResults, setDriverCallResults] = React.useState<
    Record<string, {
      status: "pending" | "success" | "failed";
      message: string | null;
      attemptedAt: string | null;
    }>
  >({});
  const anyDriverCallPending = printWithDriverCall.isPending;
  const [forceLabel, setForceLabel] = React.useState(false);

  const handlePrintWithDriverCall = async () => {
    if (!orderIds || orderIds.length === 0) return;
    const nextResults: typeof driverCallResults = {};
    for (const orderId of orderIds) {
      try {
        const res = await printWithDriverCall.mutateAsync({
          orderId,
          forceLabel,
        });
        nextResults[orderId] = {
          status: res.driver_call_status,
          message: res.driver_call_message,
          attemptedAt: res.driver_call_attempted_at,
        };
      } catch (err) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: unknown }).message)
            : "Panggilan driver gagal.";
        nextResults[orderId] = {
          status: "failed",
          message: msg,
          attemptedAt: new Date().toISOString(),
        };
      }
    }
    setDriverCallResults((prev) => ({ ...prev, ...nextResults }));
  };

  const [courierId, setCourierId] = React.useState("");
  const [shipmentType, setShipmentType] =
    React.useState<ShipmentType>("REGULAR");
  const [notes, setNotes] = React.useState("");
  // Mode pesanan: tanggal saja
  const [shipmentDate, setShipmentDate] = React.useState(today);
  // Mode standalone
  const [shipmentNo, setShipmentNo] = React.useState("");
  const [standaloneLocationId, setStandaloneLocationId] = React.useState("");
  const [shipmentDateTime, setShipmentDateTime] = React.useState<
    Date | undefined
  >(() => new Date());
  const [dateError, setDateError] = React.useState("");

  const isMarketplace =
    orderMode &&
    !!marketplaceSource &&
    MARKETPLACE_SOURCES.includes(marketplaceSource);
  const couriers = useCouriers(!isMarketplace);
  const { data: locData } = useLocations({ perPage: 100 }, !orderMode);
  const locations = locData?.items ?? [];
  const createShipment = useCreateShipment();

  const selectedCourier =
    couriers.data?.find((c) => c.id === courierId) ?? null;

  const handleCourierChange = (id: string) => {
    setCourierId(id);
    const c = couriers.data?.find((x) => x.id === id);
    if (c?.type && SHIPMENT_TYPES.some((t) => t.value === c.type)) {
      setShipmentType(c.type as ShipmentType);
    }
  };

  const handleDateTimeChange = (date: Date | undefined) => {
    setShipmentDateTime(date);
    if (date && date < new Date()) {
      setDateError("Tanggal & jam tidak boleh di masa lalu.");
    } else {
      setDateError("");
    }
  };

  const canSubmit = orderMode
    ? isMarketplace
      ? orderIds.length > 0 && !!locationId && !multiLocation
      : orderIds.length > 0 && !!locationId && !multiLocation && !!courierId
    : !!courierId && !!standaloneLocationId && !!shipmentDateTime && !dateError;

  const handleSubmit = async () => {
    let payload;
    let successMsg: string;

    if (orderMode) {
      if (!locationId) return;

      let courierName: string;
      let courierCode: string | null;

      if (isMarketplace && shippingProvider) {
        courierName = shippingProvider;
        courierCode = shippingProvider.toLowerCase().replace(/\s+/g, "-");
      } else if (selectedCourier) {
        courierName = selectedCourier.name;
        courierCode = selectedCourier.code;
      } else {
        return;
      }

      payload = {
        location_id: locationId,
        courier_name: courierName,
        courier_code: courierCode,
        shipment_type: shipmentType,
        shipment_date: shipmentDate,
        notes: notes || null,
      };
      successMsg = `Pengiriman dibuat untuk ${orderIds.length} pesanan.`;
    } else {
      if (!selectedCourier || !standaloneLocationId || !shipmentDateTime)
        return;

      if (shipmentDateTime < new Date()) {
        setDateError("Tanggal & jam tidak boleh di masa lalu.");
        return;
      }

      payload = {
        shipment_no: shipmentNo.trim() || null,
        location_id: standaloneLocationId,
        courier_name: selectedCourier.name,
        courier_code: selectedCourier.code,
        shipment_type: shipmentType,
        shipment_date: format(shipmentDateTime, "yyyy-MM-dd HH:mm:ss"),
        notes: notes || null,
      };
      successMsg = "Pengiriman baru berhasil dibuat.";
    }

    try {
      await createShipment.mutateAsync({
        payload,
        orderIds: orderIds ?? [],
      });
      toast.success(successMsg);
      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal membuat pengiriman.";
      toast.error(msg);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        {orderMode ? (
          <>
            <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm">
              <span className="font-medium">{orderIds.length}</span> pesanan
              terpilih
              {isMarketplace && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                  {marketplaceSource}
                </span>
              )}
            </div>

            {multiLocation && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                Pesanan terpilih berasal dari lokasi berbeda. Pilih pesanan
                dari satu lokasi saja.
              </p>
            )}

            <div className="space-y-1.5">
              <Label>Lokasi</Label>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                {locationName ?? (locationId ? locationId : "—")}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="new-shipment-no">No. Pengiriman</Label>
              <Input
                id="new-shipment-no"
                value={shipmentNo}
                onChange={(e) => setShipmentNo(e.target.value)}
                placeholder="Kosongkan untuk auto-generate"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Lokasi<span className="text-destructive"> *</span>
              </Label>
              <Select
                value={standaloneLocationId}
                onValueChange={setStandaloneLocationId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Lokasi" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.locationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {isMarketplace ? (
          <div className="space-y-1.5">
            <Label>Kurir</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium">
              {shippingProvider || "Dari marketplace"}
            </div>
            <p className="text-xs text-muted-foreground">
              Kurir otomatis dari {marketplaceSource} — tidak perlu dipilih
              manual.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label>
              Kurir<span className="text-destructive"> *</span>
            </Label>
            <Select value={courierId} onValueChange={handleCourierChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Kurir" />
              </SelectTrigger>
              <SelectContent>
                {couriers.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.type ? ` (${c.type})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {couriers.isLoading && (
              <p className="text-xs text-muted-foreground">
                Memuat daftar kurir…
              </p>
            )}
          </div>
        )}

        {orderMode ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipe</Label>
              <Select
                value={shipmentType}
                onValueChange={(v) => setShipmentType(v as ShipmentType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIPMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shipment-date">Tgl. Pengiriman</Label>
              <Input
                id="shipment-date"
                type="date"
                value={shipmentDate}
                onChange={(e) => setShipmentDate(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Tipe</Label>
              <Select
                value={shipmentType}
                onValueChange={(v) => setShipmentType(v as ShipmentType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIPMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Tanggal Pengiriman<span className="text-destructive"> *</span>
              </Label>
              <DateTimePicker
                value={shipmentDateTime}
                onChange={handleDateTimeChange}
                disablePast
                placeholder="Pilih tanggal & jam"
              />
              {dateError && (
                <p className="text-xs text-destructive">{dateError}</p>
              )}
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="shipment-notes">Catatan (opsional)</Label>
          <textarea
            id="shipment-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>

        {showDriverCall && (
          <div className="space-y-2 rounded-xl border border-orange-300 bg-orange-50/60 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-medium text-orange-800">
                Shopee {(shippingType ?? "").toUpperCase() === "SAME_DAY"
                  ? "Same Day"
                  : "Instant"}{" "}
                — SLA ±2 jam
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-orange-800">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5"
                  checked={forceLabel}
                  onChange={(e) => setForceLabel(e.target.checked)}
                />
                Tetap cetak meski driver gagal
              </label>
            </div>
            <p className="text-[11px] leading-snug text-orange-700">
              Menekan tombol Cetak Resi/AWB akan memanggil driver Shopee
              otomatis, lalu membuka PDF label untuk dicetak.
            </p>
            {orderIds && orderIds.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {orderIds.map((orderId) => {
                  const res = driverCallResults[orderId];
                  if (!res) return null;
                  return (
                    <DriverCallIndicator
                      key={orderId}
                      orderId={orderId}
                      status={res.status}
                      message={res.message}
                      attemptedAt={res.attemptedAt}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Batal
        </Button>
        {showDriverCall && (
          <Button
            variant="secondary"
            onClick={handlePrintWithDriverCall}
            disabled={anyDriverCallPending}
          >
            {anyDriverCallPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <PrinterIcon className="h-4 w-4" />
            )}
            {anyDriverCallPending
              ? "Memanggil driver…"
              : "Cetak Resi/AWB"}
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit || createShipment.isPending}
        >
          {createShipment.isPending && <Loader2Icon className="animate-spin" />}
          Buat Pengiriman
        </Button>
      </div>
    </>
  );
}
