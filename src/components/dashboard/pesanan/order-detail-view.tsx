"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  MapPinIcon,
  PackageIcon,
  PencilIcon,
  PhoneIcon,
  PrinterIcon,
  Trash2Icon,
  TruckIcon,
  UserIcon,
  XIcon,
  ClockIcon,
  MessageCircleIcon,
  CreditCardIcon,
  MessageSquareIcon,
  IdCardIcon,
  KeyRoundIcon,
  ImageIcon,
  ZapIcon,
  HistoryIcon,
  BanIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageTitle } from "@/components/dashboard/page-title";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { InfoField } from "@/components/dashboard/shared/info-field";
import { SectionTitle } from "@/components/dashboard/shared/section-title";
import type { LucideIcon } from "lucide-react";

import {
  CHANNEL_MAP,
  CONTACT_CHANNEL_LABELS,
  CUSTOMER_DECISION_LABELS,
  type Order,
  type OrderItem,
  type StatusHistoryEntry,
} from "@/types/pesanan/order";
import { useOrder } from "@/hooks/pesanan/use-orders";
import { useCopyToClipboard } from "@/hooks/shared/use-copy-to-clipboard";
import {
  useSetPaid,
  useMarkComplete,
  useDeleteOrderItem,
} from "@/hooks/pesanan/use-order-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

import { ContactBuyerDialog } from "./contact-buyer-dialog";
import { CourierPickupDialog } from "./courier-pickup-dialog";
import { EditOrderItemDialog } from "./edit-order-item-dialog";
import { RiwayatPesananDialog } from "./riwayat-pesanan-dialog";
import { RequestCancelDialog } from "./request-cancel-dialog";
import { canRequestChannelCancel } from "@/lib/pesanan/cancel-eligibility";
import {
  formatCurrency,
  formatDateLong,
  formatDateTime,
} from "@/lib/format";

function SummaryRow({
  label,
  value,
  deduction = false,
}: {
  label: string;
  value: number;
  deduction?: boolean;
}) {
  const isDeduction = deduction && value > 0;
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          isDeduction && "text-destructive",
        )}
      >
        {isDeduction ? "-" : ""}
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function FinancialSummary({ order }: { order: Order }) {
  const [showLainnya, setShowLainnya] = React.useState(true);
  const finance = order.finance;

  const diskonLainnya =
    (finance?.platform_voucher ?? 0) + (finance?.seller_voucher ?? 0) > 0
      ? (finance?.platform_voucher ?? 0) +
        Math.max((finance?.seller_voucher ?? 0) - order.total_disc, 0)
      : 0;
  const biayaLainnya =
    (finance?.service_fee ?? 0) + (finance?.transaction_fee ?? 0);
  const potonganBiaya =
    (finance?.commission_fee ?? 0) + (finance?.affiliate_commission ?? 0);

  return (
    <>
      <SectionTitle className="mb-4">Rincian</SectionTitle>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Jumlah SKU</span>
          <span className="font-medium text-foreground">
            {order.total_sku} jenis
          </span>
        </div>

        <div className="my-3 border-t border-border/40" />

        <SummaryRow
          label={`Qty Total (${order.total_qty} produk)`}
          value={order.sub_total}
        />
        {(finance?.refund_total ?? 0) > 0 && (
          <SummaryRow
            label="Jumlah Pengembalian Dana"
            value={finance?.refund_total ?? 0}
            deduction
          />
        )}
        <SummaryRow label="Diskon" value={order.total_disc} deduction />
        <SummaryRow label="Diskon Lainnya" value={diskonLainnya} deduction />
        <SummaryRow label="Pajak" value={order.total_tax} />
        <SummaryRow label="Ongkos Kirim" value={order.shipping_cost} />
        <SummaryRow
          label="Diskon Ongkos Kirim"
          value={finance?.platform_shipping_rebate ?? 0}
          deduction
        />

        <button
          type="button"
          onClick={() => setShowLainnya((v) => !v)}
          className="flex w-full items-center justify-between border-t border-border/40 pt-3 font-semibold"
        >
          Lainnya
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform",
              showLainnya && "rotate-180",
            )}
          />
        </button>

        {showLainnya && (
          <>
            <SummaryRow label="Biaya Lainnya" value={biayaLainnya} deduction />
            <SummaryRow
              label="Potongan Biaya"
              value={potonganBiaya}
              deduction
            />
            <SummaryRow label="Asuransi" value={order.insurance_cost} />
            <SummaryRow
              label="Biaya Proses Pesanan"
              value={finance?.order_processing_fee ?? 0}
              deduction
            />
            <SummaryRow
              label="Voucher Bayar"
              value={finance?.payment_voucher ?? 0}
              deduction
            />
          </>
        )}

        <div className="border-t border-border/40 pt-3">
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">
              {formatCurrency(order.grand_total)}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">
              Diterima Bersih (Settlement)
            </span>
            <span
              className={cn(
                "tabular-nums font-medium",
                (finance?.settlement_amount ?? 0) < 0
                  ? "text-destructive"
                  : "text-success",
              )}
            >
              {(finance?.settlement_amount ?? 0) < 0 ? "-" : ""}
              {formatCurrency(Math.abs(finance?.settlement_amount ?? 0))}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

const STEPS = [
  { key: "pending", label: "Dibuat" },
  { key: "reserved", label: "Siap Proses" },
  { key: "picked", label: "Dipick" },
  { key: "packed", label: "Dikemas" },
  { key: "shipped", label: "Dikirim" },
];

const STEP_ACTIONS: Record<string, string[]> = {
  pending: ["CREATED"],
  reserved: ["PROCESS", "PAID"],
  picked: ["FINISH_PICK"],
  packed: ["FINISH_PACK"],
  shipped: ["SHIPPED", "COMPLETED"],
};

function findStepEntry(
  history: StatusHistoryEntry[] | undefined,
  stepKey: string,
): StatusHistoryEntry | undefined {
  const actions = STEP_ACTIONS[stepKey];
  if (!actions || !history?.length) return undefined;
  return history.find((h) => actions.includes(h.action));
}

function StepKeterangan({
  entry,
  tone,
}: {
  entry: StatusHistoryEntry;
  tone: "success" | "destructive";
}) {
  return (
    <div className="hidden sm:flex flex-col items-center gap-0 text-2xs leading-tight">
      <span
        className={cn(
          "whitespace-nowrap font-medium",
          tone === "success" ? "text-success" : "text-destructive",
        )}
      >
        {formatDateTime(entry.created_at)}
      </span>
      <span className="whitespace-nowrap text-muted-foreground">
        {entry.actor_name ?? entry.actor_email}
      </span>
    </div>
  );
}

function StatusStepper({
  status,
  history,
}: {
  status: string;
  history?: StatusHistoryEntry[];
}) {
  const isCancelled = status === "cancelled";
  const currentIdx = STEPS.findIndex((s) => s.key === status);
  const cancelEntry = isCancelled
    ? history?.find((h) => h.action === "CANCELLED")
    : undefined;

  return (
    <LiquidGlass
      radius={16}
      intensity="subtle"
      className="bg-white/30 dark:bg-white/[0.04] px-6 py-5"
    >
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const isCompleted = !isCancelled && currentIdx > i;
          const isCurrent = !isCancelled && currentIdx === i;
          const entry = findStepEntry(history, step.key);

          return (
            <React.Fragment key={step.key}>
              {i > 0 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 rounded-full transition-colors",
                    !isCancelled && i <= currentIdx
                      ? "bg-success"
                      : "bg-border",
                  )}
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                        isCompleted &&
                          "border-success bg-success text-white",
                        isCurrent &&
                          "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25",
                        !isCompleted &&
                          !isCurrent &&
                          "border-muted-foreground/25 bg-background text-muted-foreground/40",
                      )}
                    >
                      {isCompleted ? (
                        <CheckIcon className="size-4" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  {entry && (
                    <TooltipContent>
                      <div className="text-xs">
                        <div>{formatDateTime(entry.created_at)}</div>
                        <div className="text-muted-foreground">
                          {entry.actor_name ?? entry.actor_email}
                        </div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
                <span
                  className={cn(
                    "text-2xs font-medium whitespace-nowrap",
                    isCompleted && "text-success",
                    isCurrent && "text-primary font-semibold",
                    !isCompleted && !isCurrent && "text-muted-foreground/50",
                  )}
                >
                  {step.label}
                </span>
                {entry && <StepKeterangan entry={entry} tone="success" />}
              </div>
            </React.Fragment>
          );
        })}

        {isCancelled && (
          <>
            <div className="h-[2px] flex-1 rounded-full bg-destructive/40" />
            <div className="flex flex-col items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-white shadow-md shadow-destructive/25"
                  >
                    <XIcon className="size-4" />
                  </button>
                </TooltipTrigger>
                {cancelEntry && (
                  <TooltipContent>
                    <div className="text-xs">
                      <div>{formatDateTime(cancelEntry.created_at)}</div>
                      <div className="text-muted-foreground">
                        {cancelEntry.actor_name ?? cancelEntry.actor_email}
                      </div>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
              <span className="text-2xs font-semibold text-destructive whitespace-nowrap">
                Dibatalkan
              </span>
              {cancelEntry && (
                <StepKeterangan entry={cancelEntry} tone="destructive" />
              )}
            </div>
          </>
        )}
      </div>
    </LiquidGlass>
  );
}

function ChannelBadge({ source }: { source: string | null }) {
  if (!source) return null;
  const ch = CHANNEL_MAP[source];
  if (!ch) {
    return (
      <Badge variant="outline" className="text-xs capitalize">
        {source}
      </Badge>
    );
  }
  const mask = `url(/channels/${source}.svg) center / contain no-repeat`;
  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 rounded-xl px-2"
      style={{ backgroundColor: `${ch.color}12` }}
    >
      <span
        className="inline-block size-4 shrink-0"
        style={{ backgroundColor: ch.color, mask, WebkitMask: mask }}
      />
      <span className="text-xs font-semibold" style={{ color: ch.color }}>
        {ch.label}
      </span>
    </span>
  );
}

function CopyableText({
  text,
  label,
  mono,
}: {
  text: string;
  label: string;
  mono?: boolean;
}) {
  const { copy } = useCopyToClipboard();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => copy(text)}
          className={cn(
            "group/copy inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors",
            mono && "font-mono",
          )}
        >
          {text}
          <CopyIcon className="size-3 opacity-0 group-hover/copy:opacity-60 transition-opacity" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return <InfoField icon={Icon} label={label} value={children} />;
}

function CourierPickupCard({
  order,
  onEdit,
}: {
  order: Order;
  onEdit: () => void;
}) {
  const pickup = order.courier_pickup;
  const isInstant = Boolean(order.is_instant);
  const hasData = Boolean(
    pickup &&
      (pickup.courier_name ||
        pickup.courier_phone ||
        pickup.pickup_code ||
        pickup.id_photo_url),
  );

  return (
    <LiquidGlass
      radius={16}
      intensity="subtle"
      className={cn(
        "bg-white/30 dark:bg-white/[0.04] p-5",
        isInstant && "ring-1 ring-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <SectionTitle>Bukti Pickup Kurir</SectionTitle>
            {isInstant && (
              <Badge
                variant="outline"
                className="gap-1 border-primary/40 text-primary"
              >
                <ZapIcon className="size-3" />
                Instant / Sameday
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Identitas kurir & kode pengambilan saat pesanan diambil.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onEdit}
        >
          <PencilIcon className="size-3.5" />
          {hasData ? "Ubah" : "Tambah"}
        </Button>
      </div>

      {hasData ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InfoRow icon={UserIcon} label="Nama Kurir">
            <span>{pickup?.courier_name || "—"}</span>
          </InfoRow>
          <InfoRow icon={PhoneIcon} label="No. Telepon">
            {pickup?.courier_phone ? (
              <CopyableText
                text={pickup.courier_phone}
                label="Salin No. Telepon"
              />
            ) : (
              <span>—</span>
            )}
          </InfoRow>
          <InfoRow icon={KeyRoundIcon} label="Kode Pengambilan">
            {pickup?.pickup_code ? (
              <CopyableText
                text={pickup.pickup_code}
                label="Salin Kode Pengambilan"
                mono
              />
            ) : (
              <span>—</span>
            )}
          </InfoRow>
          <InfoRow icon={IdCardIcon} label="Foto Identitas">
            {pickup?.id_photo_url ? (
              <a
                href={pickup.id_photo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Image unoptimized width={400} height={400}
                  src={pickup.id_photo_thumb ?? pickup.id_photo_url}
                  alt="Foto identitas kurir"
                  className="h-16 w-16 rounded-xl border border-border/60 object-cover transition-opacity hover:opacity-80"
                />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <ImageIcon className="size-3.5" />
                Tidak ada
              </span>
            )}
          </InfoRow>
          {pickup?.recorded_at && (
            <p className="text-2xs text-muted-foreground sm:col-span-2">
              Dicatat {formatDateTime(pickup.recorded_at)}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground">
          <IdCardIcon className="size-4 shrink-0" />
          Belum ada bukti pickup kurir untuk pesanan ini.
        </div>
      )}
    </LiquidGlass>
  );
}

export function OrderDetailView({ orderId }: { orderId: string }) {
  const { data, isLoading } = useOrder(orderId);
  const setPaid = useSetPaid();
  const _markComplete = useMarkComplete();
  const deleteItem = useDeleteOrderItem();
  const [contactOpen, setContactOpen] = React.useState(false);
  const [pickupOpen, setPickupOpen] = React.useState(false);
  const [riwayatOpen, setRiwayatOpen] = React.useState(false);
  const [requestCancelOpen, setRequestCancelOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<OrderItem | null>(null);
  const [deletingItemId, setDeletingItemId] = React.useState<string | null>(
    null,
  );

  const order = data?.data;

  const isMarketplace = !!order?.source && order.source !== "manual";

  const canRequestCancel = !!order && canRequestChannelCancel(order);

  const handlePrintInvoice = () => {
    window.open(
      `/dashboard/document-preview/invoice/${orderId}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handlePrintBreakdown = () => {
    window.open(
      `/dashboard/document-preview/order-breakdown/${orderId}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handlePrintLabel = () => {
    if (isMarketplace) {
      window.open(
        `/dashboard/document-preview/shipping-label/${orderId}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      toast.info("Cetak resi hanya tersedia untuk pesanan marketplace");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon={PackageIcon}
        title="Pesanan tidak ditemukan."
        className="py-20"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/pesanan?tab=all">Kembali</Link>
          </Button>
        }
      />
    );
  }

  const shippingAddress = [
    order.shipping?.address,
    order.shipping?.city,
    order.shipping?.province,
    order.shipping?.post_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title={order.salesorder_no}
        backHref="/dashboard/pesanan?tab=all"
        breadcrumb={[
          { label: "Pesanan", href: "/dashboard/pesanan?tab=all" },
          { label: order.salesorder_no },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <DownloadIcon className="size-4" />
                  Export
                  <ChevronDownIcon className="size-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePrintBreakdown}>
                  <FileTextIcon className="size-4" />
                  Rincian Pesanan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrintInvoice}>
                  <FileTextIcon className="size-4" />
                  Faktur
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  aria-label="Menu lainnya"
                >
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRiwayatOpen(true)}>
                  <HistoryIcon className="size-4" />
                  Riwayat
                </DropdownMenuItem>
                {canRequestCancel && (
                  <DropdownMenuItem onClick={() => setRequestCancelOpen(true)}>
                    <BanIcon className="size-4" />
                    Ajukan Pembatalan
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {isMarketplace && order.shipping?.tracking_number && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handlePrintLabel}
              >
                <PrinterIcon className="size-4" />
                Cetak Resi
              </Button>
            )}
            {order.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setContactOpen(true)}
              >
                <MessageCircleIcon className="size-4" />
                {order.contacted_at ? "Ubah Konfirmasi" : "Catat Konfirmasi"}
              </Button>
            )}
            {!order.is_paid && !order.is_canceled && (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={setPaid.isPending}
                onClick={() => setPaid.mutate({ orderId: order.id })}
              >
                <CreditCardIcon className="size-4" />
                {setPaid.isPending ? "Memproses..." : "Tandai Lunas"}
              </Button>
            )}
            <StatusBadge
              domain="sales-order"
              status={order.status}
              className="text-xs font-semibold ml-1"
            />
          </div>
        }
      />

      <StatusStepper status={order.status} history={order.status_history} />

      {order.is_canceled && order.cancel_reason && (
        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="border-destructive/20 bg-destructive/[0.06] px-5 py-3"
        >
          <div className="flex items-start gap-3">
            <XIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Alasan Pembatalan
              </p>
              <p className="text-sm text-destructive/80">
                {order.cancel_reason}
              </p>
            </div>
          </div>
        </LiquidGlass>
      )}

      {order.cancel_requested_at && !order.is_canceled && (
        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="border-warning/20 bg-warning/[0.06] px-5 py-3"
        >
          <div className="flex items-start gap-3">
            <MessageSquareIcon className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-warning">
                Permintaan Pembatalan
              </p>
              {order.cancel_request_reason && (
                <p className="text-sm text-warning/80">
                  {order.cancel_request_reason}
                </p>
              )}
            </div>
          </div>
        </LiquidGlass>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">

        <div className="flex flex-col gap-4">

          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04] p-5"
          >
            <SectionTitle className="mb-4">Informasi Pesanan</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={PackageIcon} label="No. Pesanan">
                <CopyableText
                  text={order.salesorder_no}
                  label="Salin No. Pesanan"
                  mono
                />
              </InfoRow>

              {order.channel_order_no && (
                <InfoRow icon={PackageIcon} label="No. Referensi Channel">
                  <CopyableText
                    text={order.channel_order_no}
                    label="Salin No. Referensi"
                    mono
                  />
                </InfoRow>
              )}

              <InfoRow icon={UserIcon} label="Pelanggan">
                <span>{order.customer_name || "—"}</span>
              </InfoRow>

              <InfoRow icon={CalendarIcon} label="Tanggal Transaksi">
                <span>{formatDateTime(order.transaction_date)}</span>
              </InfoRow>

              {order.source && (
                <InfoRow icon={TruckIcon} label="Sumber">
                  <ChannelBadge source={order.source} />
                  {order.shop_name && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {order.shop_name}
                    </span>
                  )}
                </InfoRow>
              )}

              {order.location_name && (
                <InfoRow icon={MapPinIcon} label="Lokasi Pengambilan">
                  <span>{order.location_name}</span>
                </InfoRow>
              )}
            </div>
          </LiquidGlass>

          {(order.customer_decision || order.contacted_at) && (
            <ContactSummary
              order={order}
              onEdit={() => setContactOpen(true)}
            />
          )}
          {(order.customer_decision === "replace" ||
            order.status === "pending") && (
            <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning">
              Perubahan item pesanan hanya update sistem internal (Jubelio) —
              tidak dikirim ke marketplace.
            </div>
          )}

          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04] p-5"
          >
            <SectionTitle className="mb-4">
              Daftar Produk
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({order.items.length} item)
              </span>
            </SectionTitle>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/30">
                    <TableHead className="w-12 whitespace-nowrap text-muted-foreground" />
                    <TableHead className="whitespace-nowrap text-muted-foreground">
                      Produk
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">
                      Harga
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-center text-muted-foreground">
                      Qty
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">
                      Diskon
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">
                      Jumlah
                    </TableHead>
                    {order.status === "pending" && (
                      <TableHead className="w-24 whitespace-nowrap text-right text-muted-foreground">
                        Aksi
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-border/20 last:border-0"
                    >
                      <TableCell className="px-3 py-2.5">
                        <div className="size-10 shrink-0 overflow-hidden rounded-xl border bg-muted/50">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.description || item.sku}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <PackageIcon className="size-4 opacity-50" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <div className="flex min-w-0 flex-col gap-0.5 max-w-[280px]">
                          <span className="font-medium whitespace-normal break-words">
                            {item.description || "—"}
                          </span>
                          <span className="font-mono text-2xs text-muted-foreground">
                            SKU: {item.sku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-center tabular-nums font-medium">
                        {item.qty_in_base}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums">
                        {item.disc > 0 ? (
                          <span className="text-warning">
                            {item.disc}%
                            <br />
                            <span className="text-2xs">
                              -{formatCurrency(item.disc_amount)}
                            </span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right font-medium tabular-nums">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      {order.status === "pending" && (
                        <TableCell className="px-3 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-7 p-0"
                              onClick={() => setEditingItem(item)}
                              title="Ubah item"
                            >
                              <PencilIcon className="size-3.5" />
                            </Button>
                            {order.items.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeletingItemId(item.id)}
                                title="Hapus item"
                              >
                                <Trash2Icon className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {order.items.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={order.status === "pending" ? 7 : 6}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Tidak ada produk.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </LiquidGlass>

          <div className="grid gap-4 sm:grid-cols-2">

            <LiquidGlass
              radius={16}
              intensity="subtle"
              className="bg-white/30 dark:bg-white/[0.04] p-5"
            >
              <SectionTitle className="mb-4">Penerima</SectionTitle>
              <div className="space-y-3">
                <InfoRow icon={UserIcon} label="Nama">
                  <span>
                    {order.shipping?.full_name || order.customer_name || "—"}
                  </span>
                </InfoRow>
                {order.shipping?.phone && (
                  <InfoRow icon={PhoneIcon} label="Telepon">
                    <CopyableText
                      text={order.shipping.phone}
                      label="Salin No. Telepon"
                    />
                  </InfoRow>
                )}
                {shippingAddress && (
                  <InfoRow icon={MapPinIcon} label="Alamat">
                    <span className="whitespace-normal leading-relaxed">
                      {shippingAddress}
                    </span>
                  </InfoRow>
                )}
              </div>
            </LiquidGlass>

            <LiquidGlass
              radius={16}
              intensity="subtle"
              className="bg-white/30 dark:bg-white/[0.04] p-5"
            >
              <SectionTitle className="mb-4">Pengiriman</SectionTitle>
              <div className="space-y-3">
                <InfoRow icon={TruckIcon} label="Kurir">
                  <span>{order.shipping?.provider || "—"}</span>
                </InfoRow>
                {order.shipping?.tracking_number && (
                  <InfoRow icon={PackageIcon} label="No. Resi">
                    <CopyableText
                      text={order.shipping.tracking_number}
                      label="Salin No. Resi"
                      mono
                    />
                  </InfoRow>
                )}
                {order.received_date && (
                  <InfoRow icon={CalendarIcon} label="Diterima">
                    <span>{formatDateLong(order.received_date)}</span>
                  </InfoRow>
                )}
              </div>
            </LiquidGlass>
          </div>

          <CourierPickupCard
            order={order}
            onEdit={() => setPickupOpen(true)}
          />
        </div>

        <div className="flex flex-col gap-4">

          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04] p-5 sticky top-4"
          >
            <FinancialSummary order={order} />

            <div className="mt-4 border-t border-border/40 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Status Bayar
                </span>
                <StatusBadge 
                  domain="order-payment" 
                  status={order.is_paid ? "PAID" : "UNPAID"} 
                />
              </div>
              {order.is_paid && order.payment_method_name && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  via {order.payment_method_name}
                  {order.paid_time && ` - ${formatDateTime(order.paid_time)}`}
                </p>
              )}
            </div>
          </LiquidGlass>

          {(order.buyer_message || order.seller_note) && (
            <LiquidGlass
              radius={16}
              intensity="subtle"
              className="bg-white/30 dark:bg-white/[0.04] p-5"
            >
              <SectionTitle className="mb-3">Catatan</SectionTitle>
              <div className="space-y-3">
                {order.buyer_message && (
                  <div>
                    <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
                      Pesan Pembeli
                    </p>
                    <p className="text-sm leading-relaxed rounded-lg bg-muted/40 px-3 py-2">
                      {order.buyer_message}
                    </p>
                  </div>
                )}
                {order.seller_note && (
                  <div>
                    <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
                      Catatan Penjual
                    </p>
                    <p className="text-sm leading-relaxed rounded-lg bg-muted/40 px-3 py-2">
                      {order.seller_note}
                    </p>
                  </div>
                )}
              </div>
            </LiquidGlass>
          )}

          <LiquidGlass
            radius={16}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04] px-5 py-4"
          >
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                Dibuat: {formatDateTime(order.created_at)}
              </p>
              <p>
                Diperbarui: {formatDateTime(order.updated_at)}
              </p>
            </div>
          </LiquidGlass>
        </div>
      </div>

      <ContactBuyerDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        orderId={order.id}
        orderNo={order.salesorder_no}
        defaultChannel={order.contact_channel ?? undefined}
        defaultDecision={order.customer_decision ?? undefined}
        defaultNote={order.contact_note ?? undefined}
      />

      <CourierPickupDialog
        open={pickupOpen}
        onOpenChange={setPickupOpen}
        orderId={order.id}
        orderNo={order.salesorder_no}
        pickup={order.courier_pickup}
      />

      <RiwayatPesananDialog
        open={riwayatOpen}
        onOpenChange={setRiwayatOpen}
        orderId={order.id}
      />

      <RequestCancelDialog
        open={requestCancelOpen}
        onOpenChange={setRequestCancelOpen}
        order={order}
      />

      {editingItem && (
        <EditOrderItemDialog
          open={!!editingItem}
          onOpenChange={(o) => !o && setEditingItem(null)}
          orderId={order.id}
          item={editingItem}
        />
      )}

      <ConfirmDialog
        open={!!deletingItemId}
        onOpenChange={(o) => !o && setDeletingItemId(null)}
        title="Hapus item pesanan?"
        description="Perubahan hanya berlaku di sistem internal, tidak dikirim ke marketplace."
        confirmLabel="Ya, Hapus"
        variant="destructive"
        loading={deleteItem.isPending}
        onConfirm={() => {
          if (!deletingItemId) return;
          deleteItem.mutate(
            { orderId: order.id, itemId: deletingItemId },
            { onSuccess: () => setDeletingItemId(null) },
          );
        }}
      />
    </div>
  );
}

function ContactSummary({
  order,
  onEdit,
}: {
  order: Order;
  onEdit: () => void;
}) {
  return (
    <LiquidGlass
      radius={16}
      intensity="subtle"
      className="bg-white/30 dark:bg-white/[0.04] p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <SectionTitle>Kontak & Keputusan Pembeli</SectionTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Catatan komunikasi dengan pembeli untuk pesanan stok kosong.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onEdit}
        >
          <MessageCircleIcon className="size-3.5" />
          Ubah
        </Button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InfoRow icon={CheckIcon} label="Status">
          {order.contacted_at ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full bg-success" />
              Sudah dihubungi · {formatDateTime(order.contacted_at)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-warning">
              <ClockIcon className="size-3.5" />
              Belum dihubungi
            </span>
          )}
        </InfoRow>
        {order.contact_channel && (
          <InfoRow icon={MessageSquareIcon} label="Channel">
            {CONTACT_CHANNEL_LABELS[order.contact_channel]}
          </InfoRow>
        )}
        {order.customer_decision && (
          <InfoRow icon={UserIcon} label="Keputusan">
            {CUSTOMER_DECISION_LABELS[order.customer_decision]}
            {order.decision_at && (
              <span className="ml-1 text-muted-foreground">
                · {formatDateTime(order.decision_at)}
              </span>
            )}
          </InfoRow>
        )}
        {order.contact_note && (
          <InfoRow icon={MessageSquareIcon} label="Catatan">
            <span className="whitespace-pre-line">{order.contact_note}</span>
          </InfoRow>
        )}
      </div>
    </LiquidGlass>
  );
}
