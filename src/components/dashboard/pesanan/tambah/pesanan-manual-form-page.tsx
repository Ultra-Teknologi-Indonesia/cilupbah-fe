"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ImageIcon,
  InfoIcon,
  PackageIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { PageTitle } from "@/components/dashboard/page-title";
import { TambahPelangganDialog } from "@/components/dashboard/shared/tambah-pelanggan-dialog";
import { ProductPickerDialog } from "@/components/dashboard/transaksi-pembelian/product-picker-dialog";
import type { PickedProduct } from "@/components/dashboard/transaksi-pembelian/product-picker-dialog";
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
  name: string;
  variantLabel: string;
  thumbnail: string | null;
  qty: number;
  price: number;
  discPercent: number;
  discAmount: number;
  shippingFee: number;
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
  const [items, setItems] = useState<LineItem[]>([]);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const [otherDiscount, setOtherDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);
  const [taxAmount] = useState(0);

  const [serviceFee, setServiceFee] = useState(0);
  const [sellerVoucher, setSellerVoucher] = useState(0);
  const [insuranceCost, setInsuranceCost] = useState(0);
  const [orderProcessingFee, setOrderProcessingFee] = useState(0);
  const [lainnyaOpen, setLainnyaOpen] = useState(true);

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

  function handleProductsPicked(picked: PickedProduct[]) {
    setItems((prev) => {
      const existingIds = new Set(prev.map((it) => it.itemId));
      const fresh: LineItem[] = picked
        .filter((p) => !existingIds.has(p.itemId))
        .map((p) => ({
          key: crypto.randomUUID(),
          itemId: p.itemId,
          sku: p.sku,
          name: p.name,
          variantLabel: p.variantLabel,
          thumbnail: p.thumbnail,
          qty: 1,
          price: p.sellPrice ?? 0,
          discPercent: 0,
          discAmount: 0,
          shippingFee: 0,
        }));
      return [...prev, ...fresh];
    });
  }

  const totals = useMemo(() => {
    const subTotal = items.reduce(
      (acc, it) => acc + it.qty * it.price,
      0,
    );
    const totalItemDisc = items.reduce((acc, it) => {
      const gross = it.qty * it.price;
      const percentDisc = (gross * it.discPercent) / 100;
      const disc = it.discAmount > 0 ? it.discAmount : percentDisc;
      return acc + disc;
    }, 0);
    const itemShipping = items.reduce((acc, it) => acc + it.shippingFee, 0);
    const netShipping = Math.max(0, shippingCost + itemShipping - shippingDiscount);
    const additionalFee =
      serviceFee - sellerVoucher + insuranceCost + orderProcessingFee;
    const netSub = subTotal - totalItemDisc - otherDiscount;
    const withTax = priceIncludesTax ? netSub : netSub + taxAmount;
    const grand = Math.max(0, withTax + netShipping + additionalFee);
    return {
      subTotal,
      totalItemDisc,
      netShipping,
      itemShipping,
      additionalFee,
      grand,
      qtyTotal: items.reduce((acc, it) => acc + it.qty, 0),
      productCount: items.length,
    };
  }, [
    items,
    shippingCost,
    shippingDiscount,
    otherDiscount,
    taxAmount,
    priceIncludesTax,
    serviceFee,
    sellerVoucher,
    insuranceCost,
    orderProcessingFee,
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
    if (items.length === 0) return;

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
      shipping_cost: shippingCost + totals.itemShipping,
      shipping_discount: shippingDiscount,
      insurance_cost: insuranceCost,
      service_fee: serviceFee,
      seller_voucher: sellerVoucher,
      order_processing_fee: orderProcessingFee,
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

      items: items.map((it) => ({
        item_id: it.itemId,
        sku: it.sku,
        description: it.name || null,
        qty_in_base: it.qty,
        price: it.price,
        disc: it.discAmount,
        disc_percent: it.discPercent,
      })),
    });

    router.push("/dashboard/pesanan");
  }

  const canSubmit =
    !!customerId &&
    !!customerName &&
    !!tokoId &&
    !!locationId &&
    items.length > 0 &&
    items.every((it) => it.qty > 0);

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Tambah Pesanan"
        backHref="/dashboard/pesanan"
        breadcrumb={[
          { label: "Penjualan" },
          { label: "Pesanan", href: "/dashboard/pesanan" },
          { label: "Tambah Pesanan" },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          {/* Informasi Pesanan */}
          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/40 dark:bg-white/[0.06]"
          >
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="text-base font-semibold">Informasi Pesanan</h2>
            </div>
            <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">No. Pesanan</Label>
                <Input
                  value={salesorderNo}
                  onChange={(e) => setSalesorderNo(e.target.value)}
                  placeholder="[auto]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                  Tanggal <span className="text-destructive">*</span>
                </Label>
                <DatePicker value={date} onChange={setDate} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                  Pelanggan <span className="text-destructive">*</span>
                </Label>
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
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">No. Ref</Label>
                <Input
                  value={noRef}
                  onChange={(e) => setNoRef(e.target.value)}
                  placeholder="No. ref"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                  Toko <span className="text-destructive">*</span>
                </Label>
                <Combobox
                  options={tokoOptions}
                  value={tokoId}
                  onChange={setTokoId}
                  placeholder="Pilih toko"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                  Lokasi <span className="text-destructive">*</span>
                </Label>
                <Combobox
                  options={locationOptions}
                  value={locationId}
                  onChange={setLocationId}
                  placeholder="Pilih lokasi"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Salesman</Label>
                <Combobox
                  options={salesmanOptions}
                  value={salesmanId}
                  onChange={setSalesmanId}
                  placeholder="Pilih salesman"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Keterangan</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Masukkan keterangan"
                  rows={1}
                  className="min-h-[38px] resize-none"
                />
              </div>
            </div>
          </LiquidGlass>

          {/* Produk */}
          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/40 dark:bg-white/[0.06]"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h2 className="text-base font-semibold">Produk</h2>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={priceIncludesTax}
                  onCheckedChange={setPriceIncludesTax}
                />
                Harga Termasuk Pajak
              </label>
            </div>

            <div className="flex flex-col gap-4 px-5 py-5">
              <div className="overflow-x-auto rounded-xl border border-border/60 bg-background/40">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="min-w-[240px]">Produk</TableHead>
                      <TableHead className="w-36 text-right">Harga</TableHead>
                      <TableHead className="w-20 text-right">Qty</TableHead>
                      <TableHead className="w-24 text-right">
                        Diskon %
                      </TableHead>
                      <TableHead className="w-32 text-right">
                        Diskon (Rp)
                      </TableHead>
                      <TableHead className="w-32 text-right">
                        Ongkos Angkut
                      </TableHead>
                      <TableHead className="w-36 text-right">Total</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={8}
                          className="h-40 text-center align-middle"
                        >
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <PackageIcon className="size-8 opacity-40" />
                            <p className="text-sm font-medium">
                              Belum ada produk
                            </p>
                            <p className="text-xs">
                              Klik tombol di bawah untuk menambahkan.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((it, idx) => {
                        const gross = it.qty * it.price;
                        const percentDisc = (gross * it.discPercent) / 100;
                        const disc =
                          it.discAmount > 0 ? it.discAmount : percentDisc;
                        const total = Math.max(0, gross - disc) + it.shippingFee;
                        return (
                          <TableRow key={it.key}>
                            <TableCell className="align-top">
                              <div className="flex items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                                  {it.thumbnail ? (
                                    <Image
                                      src={it.thumbnail}
                                      alt={it.name}
                                      width={40}
                                      height={40}
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="size-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium">
                                    {it.name}
                                  </div>
                                  <div className="truncate text-xs text-muted-foreground">
                                    {it.sku}
                                    {it.variantLabel
                                      ? ` · ${it.variantLabel}`
                                      : ""}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={
                                  it.price
                                    ? it.price.toLocaleString("id-ID")
                                    : ""
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
                                value={it.qty || ""}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "qty",
                                    parseCurrency(e.target.value),
                                  )
                                }
                                className="h-9 text-right tabular-nums"
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
                            <TableCell>
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={
                                  it.discAmount
                                    ? it.discAmount.toLocaleString("id-ID")
                                    : ""
                                }
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "discAmount",
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
                                value={
                                  it.shippingFee
                                    ? it.shippingFee.toLocaleString("id-ID")
                                    : ""
                                }
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "shippingFee",
                                    parseCurrency(e.target.value),
                                  )
                                }
                                className="h-9 text-right tabular-nums"
                                placeholder="0"
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatCurrency(total)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(idx)}
                              >
                                <Trash2Icon className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setProductPickerOpen(true)}
                >
                  <PlusIcon className="mr-1 size-4" />
                  Tambah Baru
                </Button>
              </div>
            </div>
          </LiquidGlass>

          {/* Penerima */}
          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/40 dark:bg-white/[0.06]"
          >
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="text-base font-semibold">Penerima</h2>
            </div>
            <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                  Nama <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nama penerima"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">No. Telepon</Label>
                <Input
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="No. telepon"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label className="text-sm font-medium">Alamat</Label>
                <Textarea
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Alamat lengkap"
                  rows={2}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Kota</Label>
                <Input
                  value={recipientCity}
                  onChange={(e) => setRecipientCity(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Provinsi</Label>
                <Input
                  value={recipientProvince}
                  onChange={(e) => setRecipientProvince(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Kode Pos</Label>
                <Input
                  value={recipientPostCode}
                  onChange={(e) => setRecipientPostCode(e.target.value)}
                />
              </div>
            </div>
          </LiquidGlass>

          {/* Pengiriman */}
          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/40 dark:bg-white/[0.06]"
          >
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="text-base font-semibold">Pengiriman</h2>
            </div>
            <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                  Metode Pengiriman <span className="text-destructive">*</span>
                </Label>
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
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Kurir</Label>
                <Combobox
                  options={courierOptions}
                  value={shippingProvider}
                  onChange={setShippingProvider}
                  placeholder="Pilih kurir"
                  disabled={deliveryMethod !== "COURIER"}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">No. Resi</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Masukkan no. resi"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                  Total Berat (gram)
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={totalWeight || ""}
                  onChange={(e) =>
                    setTotalWeight(parseCurrency(e.target.value))
                  }
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

        {/* Rincian sidebar */}
        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="sticky top-6 h-fit bg-white/40 dark:bg-white/[0.06]"
        >
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="text-base font-semibold">Rincian</h2>
          </div>
          <div className="space-y-3 px-5 py-5 text-sm">
            <RowSum label={`Qty Total (${totals.productCount} produk)`}>
              {formatCurrency(totals.subTotal)}
            </RowSum>
            <RowSum label="Diskon">
              {formatCurrency(totals.totalItemDisc)}
            </RowSum>

            <RowInput
              label="Diskon Lainnya"
              value={otherDiscount}
              onChange={setOtherDiscount}
            />
            <RowSum label="Pajak">{formatCurrency(taxAmount)}</RowSum>
            <RowInput
              label="Ongkos Kirim"
              value={shippingCost}
              onChange={setShippingCost}
            />
            <RowInput
              label="Diskon Ongkos Kirim"
              value={shippingDiscount}
              onChange={setShippingDiscount}
            />

            <div className="my-2 h-px bg-border/60" />

            <button
              type="button"
              onClick={() => setLainnyaOpen((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="font-medium">Lainnya</span>
              {lainnyaOpen ? (
                <ChevronUpIcon className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDownIcon className="size-4 text-muted-foreground" />
              )}
            </button>

            {lainnyaOpen && (
              <div className="space-y-3">
                <RowInput
                  label="Biaya Lainnya"
                  value={serviceFee}
                  onChange={setServiceFee}
                />
                <RowInput
                  label="Potongan Biaya"
                  value={sellerVoucher}
                  onChange={setSellerVoucher}
                />
                <RowInput
                  label="Asuransi"
                  value={insuranceCost}
                  onChange={setInsuranceCost}
                />
                <RowInput
                  label="Biaya Proses Pesanan"
                  value={orderProcessingFee}
                  onChange={setOrderProcessingFee}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                Biaya Tambahan
                <InfoIcon
                  className="size-3.5 text-muted-foreground"
                  aria-label="Total dari Biaya Lainnya - Potongan Biaya + Asuransi + Biaya Proses Pesanan"
                />
              </span>
              <span className="font-semibold tabular-nums text-primary">
                {formatCurrency(totals.additionalFee)}
              </span>
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

      {/* Batal / Simpan */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/pesanan")}
          disabled={createMut.isPending}
        >
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit || createMut.isPending}
        >
          {createMut.isPending ? "Menyimpan…" : "Simpan"}
        </Button>
      </div>

      <TambahPelangganDialog
        open={addPelangganOpen}
        onOpenChange={setAddPelangganOpen}
        defaultName={customerQuery}
        onCreated={(c) => handleCustomerSelected(c)}
      />

      <ProductPickerDialog
        open={productPickerOpen}
        onOpenChange={setProductPickerOpen}
        onPick={handleProductsPicked}
        excludeIds={items.map((it) => it.itemId)}
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

function RowInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <div className="relative w-40">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          Rp
        </span>
        <Input
          type="text"
          inputMode="numeric"
          value={value ? value.toLocaleString("id-ID") : ""}
          onChange={(e) => onChange(parseCurrency(e.target.value))}
          className={cn("h-9 pl-9 pr-3 text-right tabular-nums")}
          placeholder="0"
        />
      </div>
    </div>
  );
}
