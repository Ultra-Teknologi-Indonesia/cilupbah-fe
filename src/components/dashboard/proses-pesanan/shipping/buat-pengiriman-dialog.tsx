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
import { Combobox } from "@/components/ui/combobox";
import { DatePicker, DateTimePicker } from "@/components/ui/date-picker";
import {
  useCouriers,
  useCreateShipment,
} from "@/hooks/proses-pesanan/use-fulfillment";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import {
  SHIPMENT_TYPES,
  type ShipmentType,
} from "@/types/proses-pesanan/fulfillment";
import { isShopeeInstantOrSameDay } from "@/lib/proses-pesanan/shopee";
import { guessShipmentTypeFromCourierName } from "@/lib/proses-pesanan/shipment-type";

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

  const [courierId, setCourierId] = React.useState("");
  const [shipmentType, setShipmentType] = React.useState<ShipmentType>(
    () => (showDriverCall ? "INSTANT" : "REGULAR"),
  );
  const [notes, setNotes] = React.useState("");
  const [shipmentDateObj, setShipmentDateObj] = React.useState<Date | undefined>(
    () => new Date(),
  );
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

  const handleCourierChange = (id: string | null) => {
    setCourierId(id ?? "");
    const c = couriers.data?.find((x) => x.id === id);
    if (c?.name) {
      setShipmentType(guessShipmentTypeFromCourierName(c.name));
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
      ? orderIds.length > 0 &&
        !!locationId &&
        !multiLocation &&
        !!shipmentDateObj
      : orderIds.length > 0 &&
        !!locationId &&
        !multiLocation &&
        !!courierId &&
        !!shipmentDateObj
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

      if (!shipmentDateObj) return;

      payload = {
        location_id: locationId,
        courier_name: courierName,
        courier_code: courierCode,
        shipment_type: shipmentType,
        shipment_date: format(shipmentDateObj, "yyyy-MM-dd"),
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
            <Combobox
              value={courierId || null}
              onChange={handleCourierChange}
              options={
                couriers.data?.map((c) => ({
                  value: c.id,
                  label: c.name,
                })) ?? []
              }
              placeholder="Pilih Kurir"
              searchPlaceholder="Cari kurir"
              emptyText="Kurir tidak ditemukan."
              loading={couriers.isLoading}
            />
            {couriers.isLoading && (
              <p className="text-xs text-muted-foreground">
                Memuat daftar kurir…
              </p>
            )}
          </div>
        )}

        {orderMode ? (
          <div className="space-y-1.5">
            <Label htmlFor="shipment-date">Tgl. Pengiriman</Label>
            <DatePicker
              id="shipment-date"
              value={shipmentDateObj}
              onChange={setShipmentDateObj}
            />
            <p className="text-xs text-muted-foreground">
              Tipe pengiriman terdeteksi otomatis:{" "}
              <span className="font-medium capitalize">
                {shipmentType.toLowerCase().replace(/_/g, " ")}
              </span>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Tipe Pengiriman</Label>
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
              <p className="text-xs text-muted-foreground">
                Menentukan SLA & panggilan driver otomatis untuk pengiriman
                instan/same-day.
              </p>
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
          <div className="rounded-xl border border-orange-300 bg-orange-50/60 px-3 py-2.5">
            <div className="text-xs font-medium text-orange-800">
              Shopee{" "}
              {(shippingType ?? "").toUpperCase() === "SAME_DAY"
                ? "Same Day"
                : "Instant"}{" "}
              — SLA ±2 jam
            </div>
            <p className="text-2xs leading-snug text-orange-700 mt-1">
              Driver Shopee akan dipanggil otomatis saat packing selesai.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit || createShipment.isPending}
        >
          {createShipment.isPending && (
            <Loader2Icon className="animate-spin" />
          )}
          Buat Pengiriman
        </Button>
      </div>
    </>
  );
}
