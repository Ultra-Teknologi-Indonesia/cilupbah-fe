"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, ScanBarcodeIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { PageTitle } from "@/components/dashboard/page-title";
import { TambahPelangganDialog } from "@/components/dashboard/shared/tambah-pelanggan-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useContacts } from "@/hooks/kontak-pemasok/use-contacts";
import { useCreateManualOrder } from "@/hooks/pesanan/use-create-manual-order";
import { SkuLookupService } from "@/services/pesanan/sku-lookup.service";
import { cn } from "@/lib/utils";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { useSalesmen } from "@/hooks/kontak-pemasok/use-salesman";
import { useActiveInternalStores } from "@/hooks/penjualan/use-internal-stores";
import { useCouriers } from "@/hooks/proses-pesanan/use-fulfillment";
import { formatCurrency } from "@/lib/format";
import type { ContactItem } from "@/types/kontak-pemasok/contact";
import type { DeliveryMethod } from "@/types/pesanan/manual-order";

interface LineItem {
  key: string;
  itemId: string;
  sku: string;
  description: string;
  qty: number;
  price: number;
  discPercent: number;
  available: number | null;
}

function newLine(): LineItem {
  return {
    key: crypto.randomUUID(),
    itemId: "",
    sku: "",
    description: "",
    qty: 1,
    price: 0,
    discPercent: 0,
    available: null,
  };
}

function toDateOnly(d: Date | undefined) {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseCurrency(s: string) {
  return Number(s.replace(/\D/g, "")) || 0;
}

export function PesananManualFormPage() {
  const router = useRouter();

  const [salesorderNo, setSalesorderNo] = useState("[auto]");
  const [noRef, setNoRef] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState("");

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [addPelangganOpen, setAddPelangganOpen] = useState(false);
  const debouncedCustomerQuery = useDebouncedValue(customerQuery, 250);

  const [salesmanId, setSalesmanId] = useState<string | null>(null);
  const [tokoId, setTokoId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  const [priceIncludesTax, setPriceIncludesTax] = useState(false);
  const [items, setItems] = useState<LineItem[]>([newLine()]);
  const [scanCode, setScanCode] = useState("");
  const [scanBusy, setScanBusy] = useState(false);

  const [otherDiscount, setOtherDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientCity, setRecipientCity] = useState("");
  const [recipientProvince, setRecipientProvince] = useState("");
  const [recipientPostCode, setRecipientPostCode] = useState("");

  const [isPaid, setIsPaid] = useState(false);
  const [isCod, setIsCod] = useState(false);
  const [isJubelio, setIsJubelio] = useState(false);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("COURIER");
  const [shippingProvider, setShippingProvider] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [totalWeight, setTotalWeight] = useState(0);

  const { data: contactsData, isFetching: contactsLoading } = useContacts({
    per_page: 20,
    "filter[type]": "CUSTOMER",
    search: debouncedCustomerQuery || undefined,
  });

  const { data: salesmen } = useSalesmen();
  const { data: stores } = useActiveInternalStores();
  const { data: locData } = useLocations({ perPage: 100 });
  const { data: couriers } = useCouriers();

  useEffect(() => {
    if (!tokoId && stores && stores.length > 0) setTokoId(stores[0].id);
  }, [stores, tokoId]);

  const customerOptions = useMemo(
    () =>
      (contactsData?.items ?? []).map((c) => ({
        value: c.id,
        label: c.name,
        hint: c.phone ?? c.code,
      })),
    [contactsData],
  );

  const salesmanOptions = useMemo(
    () =>
      (salesmen?.items ?? []).map((s) => ({
        value: s.id,
        label: s.name,
        hint: s.code,
      })),
    [salesmen],
  );

  const tokoOptions = useMemo(
    () =>
      (stores ?? []).map((s) => ({
        value: s.id,
        label: s.name,
        hint: s.code,
      })),
    [stores],
  );

  const locationOptions = useMemo(
    () =>
      (locData?.items ?? [])
        .filter((l) => l.isWarehouse)
        .map((l) => ({ value: l.id, label: l.locationName })),
    [locData],
  );

  const courierOptions = useMemo(
    () =>
      (couriers ?? [])
        .filter((c) => !!c.code)
        .map((c) => ({
          value: c.code as string,
          label: c.name,
        })),
    [couriers],
  );

  const deliveryOptions = useMemo(
    () => [
      { value: "COURIER", label: "Kurir" },
      { value: "SELF_PICKUP", label: "Ambil Sendiri" },
      { value: "JUBELIO_SHIPMENT", label: "Jubelio Shipment" },
    ],
    [],
  );

  function updateItem<K extends keyof LineItem>(
    idx: number,
    key: K,
    value: LineItem[K],
  ) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)),
    );
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleScan(rawSku: string) {
    const sku = rawSku.trim();
    if (!sku) return;
    if (!locationId) {
      toast.error("Pilih lokasi dulu sebelum scan produk.");
      return;
    }
    setScanBusy(true);
    try {
      const result = await SkuLookupService.lookup(sku, locationId);
      setItems((prev) => {
        const existingIdx = prev.findIndex((it) => it.itemId === result.item_id);
        if (existingIdx >= 0) {
          return prev.map((it, i) =>
            i === existingIdx
              ? { ...it, qty: it.qty + 1, available: result.available }
              : it,
          );
        }
        const newItem: LineItem = {
          key: crypto.randomUUID(),
          itemId: result.item_id,
          sku: result.sku,
          description: result.name ?? "",
          qty: 1,
          price: result.sell_price,
          discPercent: 0,
          available: result.available,
        };
        const emptyIdx = prev.findIndex((it) => !it.sku.trim());
        if (emptyIdx >= 0) {
          return prev.map((it, i) => (i === emptyIdx ? newItem : it));
        }
        return [...prev, newItem];
      });
      setScanCode("");
      toast.success(`${result.sku} · stok tersedia ${result.available}`);
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ??
          `SKU "${sku}" tidak ditemukan.`,
      );
    } finally {
      setScanBusy(false);
    }
  }

  async function refreshAvailable(idx: number) {
    const it = items[idx];
    if (!it.sku.trim() || !locationId) return;
    try {
      const result = await SkuLookupService.lookup(it.sku.trim(), locationId);
      setItems((prev) =>
        prev.map((row, i) =>
          i === idx
            ? {
                ...row,
                itemId: result.item_id,
                available: result.available,
                price: row.price || result.sell_price,
                description: row.description || (result.name ?? ""),
              }
            : row,
        ),
      );
    } catch {
      setItems((prev) =>
        prev.map((row, i) =>
          i === idx ? { ...row, available: null, itemId: "" } : row,
        ),
      );
    }
  }

  const totals = useMemo(() => {
    const subTotal = items.reduce(
      (acc, it) => acc + it.qty * it.price,
      0,
    );
    const totalItemDisc = items.reduce(
      (acc, it) => acc + (it.qty * it.price * it.discPercent) / 100,
      0,
    );
    const netShipping = Math.max(0, shippingCost - shippingDiscount);
    const netSub = subTotal - totalItemDisc - otherDiscount;
    const withTax = priceIncludesTax ? netSub : netSub + taxAmount;
    const grand = Math.max(0, withTax + netShipping);
    return {
      subTotal,
      totalItemDisc,
      netShipping,
      grand,
      qtyTotal: items.reduce((acc, it) => acc + it.qty, 0),
      productCount: items.filter((it) => it.sku.trim()).length,
    };
  }, [
    items,
    shippingCost,
    shippingDiscount,
    otherDiscount,
    taxAmount,
    priceIncludesTax,
  ]);

  const createMut = useCreateManualOrder();

  function handleCustomerSelected(contact: ContactItem) {
    setCustomerId(contact.id);
    setCustomerName(contact.name);
    if (!recipientName) setRecipientName(contact.name);
    if (!recipientPhone && contact.phone) setRecipientPhone(contact.phone);
    if (!recipientAddress && contact.address)
      setRecipientAddress(contact.address);
    if (!recipientCity && (contact as unknown as { city?: string }).city)
      setRecipientCity(
        (contact as unknown as { city?: string }).city as string,
      );
    if (!recipientProvince && contact.province)
      setRecipientProvince(contact.province);
    if (!recipientPostCode && contact.postal_code)
      setRecipientPostCode(contact.postal_code);
  }

  async function handleSubmit() {
    if (!customerId || !customerName) return;
    if (!tokoId || !locationId) return;
    if (items.filter((it) => it.sku.trim()).length === 0) return;

    await createMut.mutateAsync({
      salesorder_no:
        salesorderNo.trim() === "" || salesorderNo === "[auto]"
          ? null
          : salesorderNo.trim(),
      no_ref: noRef || null,
      transaction_date: toDateOnly(date),
      internal_store_id: tokoId,
      salesman_id: salesmanId,
      location_id: locationId,
      customer_id: customerId,
      customer_name: customerName,
      note: note || null,

      sub_total: totals.subTotal,
      total_disc: totals.totalItemDisc,
      other_discount: otherDiscount,
      total_tax: taxAmount,
      shipping_cost: shippingCost,
      shipping_discount: shippingDiscount,
      grand_total: totals.grand,
      price_includes_tax: priceIncludesTax,

      is_paid: isPaid,
      is_cod: isCod,
      is_jubelio_shipment: isJubelio,

      delivery_method: deliveryMethod,
      shipping_provider: deliveryMethod === "COURIER" ? shippingProvider : null,
      tracking_number: trackingNumber || null,
      order_weight_gram: totalWeight || null,

      shipping_full_name: recipientName || customerName,
      shipping_phone: recipientPhone || null,
      shipping_address: recipientAddress || null,
      shipping_city: recipientCity || null,
      shipping_province: recipientProvince || null,
      shipping_post_code: recipientPostCode || null,

      items: items
        .filter((it) => it.sku.trim() && it.itemId)
        .map((it) => ({
          item_id: it.itemId,
          sku: it.sku,
          description: it.description || null,
          qty_in_base: it.qty,
          price: it.price,
          disc_percent: it.discPercent,
        })),
    });

    router.push("/dashboard/pesanan");
  }

  const overStockItems = items.filter(
    (it) => it.sku.trim() && it.available !== null && it.qty > it.available,
  );
  const missingItemId = items.some((it) => it.sku.trim() && !it.itemId);

  const canSubmit =
    !!customerId &&
    !!customerName &&
    !!tokoId &&
    !!locationId &&
    items.some((it) => it.sku.trim() && it.qty > 0) &&
    overStockItems.length === 0 &&
    !missingItemId;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Tambah Pesanan"
        breadcrumb={[
          { label: "Penjualan" },
          { label: "Pesanan", href: "/dashboard/pesanan" },
          { label: "Tambah Pesanan" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/pesanan")}
              disabled={createMut.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || createMut.isPending}
            >
              {createMut.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <LiquidGlass radius={16} className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>No. Pesanan *</Label>
                <Input
                  value={salesorderNo}
                  onChange={(e) => setSalesorderNo(e.target.value)}
                  placeholder="[auto]"
                />
              </div>
              <div>
                <Label>Tanggal *</Label>
                <DatePicker value={date} onChange={setDate} />
              </div>
              <div>
                <Label>Pelanggan *</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Combobox
                      options={customerOptions}
                      value={customerId}
                      onChange={(id) => {
                        setCustomerId(id);
                        const c = customerOptions.find((o) => o.value === id);
                        if (c) setCustomerName(c.label);
                      }}
                      onQueryChange={setCustomerQuery}
                      loading={contactsLoading}
                      placeholder="Pilih pelanggan"
                      searchPlaceholder="Cari pelanggan"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setAddPelangganOpen(true)}
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Toko *</Label>
                <Combobox
                  options={tokoOptions}
                  value={tokoId}
                  onChange={setTokoId}
                  placeholder="Pilih toko"
                />
              </div>
              <div>
                <Label>No. Ref</Label>
                <Input
                  value={noRef}
                  onChange={(e) => setNoRef(e.target.value)}
                  placeholder="No. ref"
                />
              </div>
              <div>
                <Label>Lokasi *</Label>
                <Combobox
                  options={locationOptions}
                  value={locationId}
                  onChange={setLocationId}
                  placeholder="Pilih lokasi"
                />
              </div>
              <div>
                <Label>Salesman</Label>
                <Combobox
                  options={salesmanOptions}
                  value={salesmanId}
                  onChange={setSalesmanId}
                  placeholder="Pilih salesman"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Keterangan</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Masukkan keterangan"
                  rows={2}
                />
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass radius={16} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Produk</h2>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={priceIncludesTax}
                  onCheckedChange={setPriceIncludesTax}
                />
                Harga Termasuk Pajak
              </label>
            </div>

            <div className="mb-4">
              <div className="relative">
                <ScanBarcodeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleScan(scanCode);
                    }
                  }}
                  disabled={scanBusy || !locationId}
                  placeholder={
                    locationId
                      ? "Scan / ketik SKU lalu tekan Enter"
                      : "Pilih lokasi dulu, baru scan"
                  }
                  className="h-11 pl-9"
                  autoComplete="off"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Stok akan dicek otomatis berdasarkan lokasi yang dipilih.
              </p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="w-24 text-right">Stok</TableHead>
                    <TableHead className="w-24 text-right">Qty</TableHead>
                    <TableHead className="w-40 text-right">Harga</TableHead>
                    <TableHead className="w-24 text-right">Diskon %</TableHead>
                    <TableHead className="w-40 text-right">Total</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it, idx) => {
                    const gross = it.qty * it.price;
                    const disc = (gross * it.discPercent) / 100;
                    const overStock =
                      it.available !== null && it.qty > it.available;
                    return (
                      <TableRow key={it.key}>
                        <TableCell>
                          <Input
                            value={it.sku}
                            onChange={(e) =>
                              updateItem(idx, "sku", e.target.value)
                            }
                            onBlur={() => refreshAvailable(idx)}
                            placeholder="SKU"
                            className={cn(
                              "h-9",
                              it.sku && !it.itemId && "border-destructive",
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={it.description}
                            onChange={(e) =>
                              updateItem(idx, "description", e.target.value)
                            }
                            placeholder="Deskripsi (opsional)"
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {it.available === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span
                              className={cn(
                                overStock
                                  ? "font-semibold text-destructive"
                                  : "text-muted-foreground",
                              )}
                            >
                              {it.available}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={it.qty || ""}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "qty",
                                parseCurrency(e.target.value),
                              )
                            }
                            className={cn(
                              "h-9 text-right tabular-nums",
                              overStock && "border-destructive ring-2 ring-destructive/20",
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={
                              it.price ? it.price.toLocaleString("id-ID") : ""
                            }
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "price",
                                parseCurrency(e.target.value),
                              )
                            }
                            className="h-9 text-right tabular-nums"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={it.discPercent || ""}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "discPercent",
                                Math.min(
                                  100,
                                  parseCurrency(e.target.value),
                                ),
                              )
                            }
                            className="h-9 text-right tabular-nums"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(gross - disc)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(idx)}
                            disabled={items.length === 1}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setItems((p) => [...p, newLine()])}
              >
                <PlusIcon className="mr-1 size-4" />
                Tambah Baris
              </Button>

              {(overStockItems.length > 0 || missingItemId) && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {overStockItems.length > 0
                    ? `Qty melebihi stok tersedia pada ${overStockItems.length} produk. Turunkan qty atau ganti lokasi.`
                    : "Beberapa SKU belum tervalidasi. Klik ke luar field SKU (blur) untuk cek stok."}
                </div>
              )}
            </div>
          </LiquidGlass>

          <LiquidGlass radius={16} className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Penerima</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nama *</Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nama penerima"
                />
              </div>
              <div>
                <Label>No. Telepon</Label>
                <Input
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="No. telepon"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Alamat</Label>
                <Textarea
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Alamat lengkap"
                  rows={2}
                />
              </div>
              <div>
                <Label>Kota</Label>
                <Input
                  value={recipientCity}
                  onChange={(e) => setRecipientCity(e.target.value)}
                />
              </div>
              <div>
                <Label>Provinsi</Label>
                <Input
                  value={recipientProvince}
                  onChange={(e) => setRecipientProvince(e.target.value)}
                />
              </div>
              <div>
                <Label>Kode Pos</Label>
                <Input
                  value={recipientPostCode}
                  onChange={(e) => setRecipientPostCode(e.target.value)}
                />
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass radius={16} className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Pengiriman</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Metode Pengiriman *</Label>
                <Combobox
                  options={deliveryOptions}
                  value={deliveryMethod}
                  onChange={(v) => {
                    if (!v) return;
                    setDeliveryMethod(v as DeliveryMethod);
                    if (v !== "COURIER") setShippingProvider(null);
                    if (v === "SELF_PICKUP") setIsJubelio(false);
                  }}
                  placeholder="Pilih metode"
                />
              </div>
              <div>
                <Label>Kurir</Label>
                <Combobox
                  options={courierOptions}
                  value={shippingProvider}
                  onChange={setShippingProvider}
                  placeholder="Pilih kurir"
                  disabled={deliveryMethod !== "COURIER"}
                />
              </div>
              <div>
                <Label>No. Resi</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Masukkan no. resi"
                />
              </div>
              <div>
                <Label>Total Berat (gram)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={totalWeight || ""}
                  onChange={(e) => setTotalWeight(parseCurrency(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                <div className="text-sm">COD</div>
                <Switch checked={isCod} onCheckedChange={setIsCod} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                <div className="text-sm">Jubelio Shipment</div>
                <Switch
                  checked={isJubelio}
                  onCheckedChange={setIsJubelio}
                  disabled={deliveryMethod === "SELF_PICKUP"}
                />
              </div>
            </div>
          </LiquidGlass>
        </div>

        <LiquidGlass radius={16} className="sticky top-6 h-fit p-6">
          <h2 className="mb-4 text-base font-semibold">Rincian</h2>
          <div className="space-y-3 text-sm">
            <RowSum label={`Qty Total (${totals.productCount} produk)`}>
              {formatCurrency(totals.subTotal)}
            </RowSum>
            <RowSum label="Diskon">{formatCurrency(totals.totalItemDisc)}</RowSum>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Diskon Lainnya</span>
              <CurrencyInput
                value={otherDiscount}
                onChange={setOtherDiscount}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pajak</span>
              <CurrencyInput value={taxAmount} onChange={setTaxAmount} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ongkos Kirim</span>
              <CurrencyInput
                value={shippingCost}
                onChange={setShippingCost}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Diskon Ongkir</span>
              <CurrencyInput
                value={shippingDiscount}
                onChange={setShippingDiscount}
              />
            </div>
            <div className="my-2 h-px bg-border/60" />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-semibold text-primary tabular-nums">
                {formatCurrency(totals.grand)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span>Sudah Lunas</span>
              <Switch checked={isPaid} onCheckedChange={setIsPaid} />
            </div>
            {isPaid && (
              <Badge variant="secondary" className="w-full justify-center">
                Tunai
              </Badge>
            )}
          </div>
        </LiquidGlass>
      </div>

      <TambahPelangganDialog
        open={addPelangganOpen}
        onOpenChange={setAddPelangganOpen}
        defaultName={customerQuery}
        onCreated={(c) => handleCustomerSelected(c)}
      />
    </div>
  );
}

function RowSum({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{children}</span>
    </div>
  );
}

function CurrencyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      value={value ? value.toLocaleString("id-ID") : ""}
      onChange={(e) => onChange(parseCurrency(e.target.value))}
      className="h-8 w-32 text-right tabular-nums"
      placeholder="0"
    />
  );
}
