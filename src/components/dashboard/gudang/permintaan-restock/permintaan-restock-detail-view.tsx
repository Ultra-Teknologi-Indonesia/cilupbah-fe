"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  ExternalLinkIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from "lucide-react";

import { PageTitle } from "@/components/dashboard/page-title";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { CopySku } from "@/components/dashboard/shared/copy-sku";
import { StockedProductPickerDialog } from "@/components/dashboard/transaksi-stok/stocked-product-picker-dialog";
import type { StockedPickedProduct } from "@/components/dashboard/transaksi-stok/stocked-product-picker-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatDateTimeFull } from "@/lib/format";
import {
  useAddReplenishmentItem,
  useRejectReplenishment,
  useRemoveReplenishmentItem,
  useStockReplenishmentDetail,
} from "@/hooks/gudang/use-stock-replenishment";
import type { StockReplenishmentItem } from "@/types/gudang/stock-replenishment";
import { AcceptReplenishmentDialog } from "./accept-replenishment-dialog";
import { EditReplenishmentItemDialog } from "./edit-replenishment-item-dialog";

interface Props {
  id: string;
}

export function PermintaanRestockDetailView({ id }: Props) {
  const { data: req, isLoading } = useStockReplenishmentDetail(id);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editItem, setEditItem] = useState<StockReplenishmentItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<StockReplenishmentItem | null>(
    null,
  );
  const rejectMut = useRejectReplenishment();
  const addItemMut = useAddReplenishmentItem();
  const removeItemMut = useRemoveReplenishmentItem();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <PageTitle title="Detail Permintaan" backHref="/dashboard/permintaan-restock" />
        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="bg-white/40 dark:bg-white/[0.06]"
        >
          <div className="py-16 text-center text-sm text-muted-foreground">
            Memuat…
          </div>
        </LiquidGlass>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="flex flex-col gap-5">
        <PageTitle title="Detail Permintaan" backHref="/dashboard/permintaan-restock" />
        <LiquidGlass
          radius={16}
          intensity="subtle"
          className="bg-white/40 dark:bg-white/[0.06]"
        >
          <div className="py-16 text-center text-sm text-muted-foreground">
            Permintaan tidak ditemukan.
          </div>
        </LiquidGlass>
      </div>
    );
  }

  const items = req.items ?? [];
  const totalQty = items.reduce((acc, i) => acc + i.qty, 0);
  const editable = req.status === "PENDING";

  async function handlePickItems(picked: StockedPickedProduct[]) {
    for (const p of picked) {
      await addItemMut.mutateAsync({
        id: req!.id,
        payload: { item_id: p.itemId, sku: p.sku, qty: 1 },
      });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Detail Permintaan Pengisian Stok"
        backHref="/dashboard/permintaan-restock"
        breadcrumb={[
          { label: "Gudang" },
          {
            label: "Permintaan Pengisian Stok",
            href: "/dashboard/permintaan-restock",
          },
          { label: "Detail" },
        ]}
      />

      {/* Header ringkas */}
      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <StatusBadge domain="stock-replenishment" status={req.status} />
            <span className="font-mono text-xs text-muted-foreground">
              #{req.id.slice(0, 8)}
            </span>
          </div>
          {req.status === "PENDING" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setRejectOpen(true)}
                disabled={rejectMut.isPending}
              >
                <XIcon className="mr-1 size-4 text-destructive" />
                Tolak
              </Button>
              <Button variant="primary" onClick={() => setAcceptOpen(true)}>
                <CheckIcon className="mr-1 size-4" />
                Terima
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-5 px-5 py-5 md:grid-cols-2 lg:grid-cols-3">
          <InfoField label="Diminta Oleh">
            {req.requested_by_name ?? (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Sistem
              </span>
            )}
          </InfoField>
          <InfoField label="Diminta Pada">
            {formatDateTime(req.requested_at)}
          </InfoField>
          <InfoField label="Rute">
            <span className="inline-flex items-center gap-2 text-sm">
              <span className="font-medium">
                {req.from_location_name ?? "—"}
              </span>
              <ArrowRightIcon className="size-3.5 text-muted-foreground" />
              <span className="font-medium">
                {req.to_location_name ?? "—"}
              </span>
            </span>
          </InfoField>

          <InfoField label="Assignee">{req.assignee_name ?? "—"}</InfoField>
          <InfoField label="Disetujui Pada">
            {req.accepted_at ? formatDateTime(req.accepted_at) : "—"}
          </InfoField>
          <InfoField label="Ditolak Pada">
            {req.rejected_at ? formatDateTime(req.rejected_at) : "—"}
          </InfoField>

          <InfoField label="Transfer Keluar">
            {req.transfer_out_number ? (
              <Link
                href={`/dashboard/barang-keluar?transfer=${req.transfer_out_id}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLinkIcon className="size-3.5" />
                {req.transfer_out_number}
                {req.transfer_out_status && (
                  <span className="text-xs text-muted-foreground">
                    · {req.transfer_out_status}
                  </span>
                )}
              </Link>
            ) : (
              "—"
            )}
          </InfoField>
          <InfoField label="Selesai Pada">
            {req.done_at ? formatDateTime(req.done_at) : "—"}
          </InfoField>
          <InfoField label="Alasan Ditolak">{req.reject_reason ?? "—"}</InfoField>

          <div className="md:col-span-2 lg:col-span-3">
            <InfoField label="Catatan">{req.note ?? "—"}</InfoField>
          </div>
        </div>
      </LiquidGlass>

      {/* Daftar produk */}
      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <PackageIcon className="size-4" />
            Produk
          </h2>
          <span className="text-xs text-muted-foreground">
            {items.length} SKU · {totalQty} qty
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="w-24 text-right">Qty</TableHead>
                <TableHead>Alasan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Tidak ada item pada permintaan ini.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-mono text-xs">{it.sku}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {it.qty}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {it.reason ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </LiquidGlass>

      <AcceptReplenishmentDialog
        open={acceptOpen}
        onOpenChange={setAcceptOpen}
        request={req}
      />

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Tolak permintaan pengisian stok?"
        description="Tim gudang perlu mengirim ulang permintaan bila ditolak."
        confirmLabel="Tolak"
        onConfirm={async () => {
          await rejectMut.mutateAsync({ id: req.id });
          setRejectOpen(false);
        }}
      />
    </div>
  );
}

function InfoField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  );
}
