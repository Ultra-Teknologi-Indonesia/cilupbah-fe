"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, Loader2Icon, PackageCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/dashboard/page-title";
import { SectionTitle } from "@/components/dashboard/shared/section-title";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import { QtyConfirmInput } from "@/components/ui/qty-confirm-input";
import { useIncomingTransferDetail } from "@/hooks/barang-masuk/use-inventory-transfers";
import { useReceiveTransfer } from "@/hooks/barang-masuk/use-receive-transfer";
import { formatDate } from "@/lib/format";

const LIST_HREF = "/dashboard/barang-masuk/transfer";

interface ItemQty {
  item_id: string;
  qty: number;
  max: number;
  notes: string;
}

export function TerimaTransferMasukView({ id }: { id: string }) {
  const router = useRouter();
  const { data: transfer, isLoading } = useIncomingTransferDetail(id);
  const receiveMutation = useReceiveTransfer();

  const [receivedBy, setReceivedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [itemQtys, setItemQtys] = useState<Record<string, ItemQty>>({});

  const items = useMemo(() => transfer?.items ?? [], [transfer]);

  useEffect(() => {
    if (items.length === 0) return;
    setItemQtys((prev) => {
      const next = { ...prev };
      let changed = false;
      items.forEach((item) => {
        if (!next[item.id]) {
          const remaining = item.qty - item.received_qty;
          if (remaining > 0) {
            next[item.id] = {
              item_id: item.item_id,
              qty: remaining,
              max: remaining,
              notes: "",
            };
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [items]);

  const hasValidQty = Object.values(itemQtys).some((i) => i.qty > 0);
  const canSubmit = hasValidQty && !!receivedBy.trim() && !receiveMutation.isPending;

  function handleQtyChange(rowId: string, maxQty: number, value: number | "") {
    const num = value === "" ? 0 : Math.max(0, Math.min(value, maxQty));
    setItemQtys((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], max: maxQty, qty: num },
    }));
  }

  function handleItemNoteChange(rowId: string, value: string) {
    setItemQtys((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], notes: value },
    }));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    receiveMutation.mutate(
      {
        id,
        data: {
          received_by: receivedBy.trim(),
          items: Object.values(itemQtys)
            .filter((i) => i.qty > 0)
            .map((i) => ({
              item_id: i.item_id,
              received_qty: i.qty,
              notes: i.notes.trim() || undefined,
            })),
        },
      },
      { onSuccess: () => router.push(LIST_HREF) },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Terima Transfer Masuk"
        description={transfer ? `Penerimaan untuk ${transfer.transfer_number}` : "Memuat..."}
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Gudang" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Terima Transfer" },
        ]}
      />

      {isLoading ? (
        <LiquidGlass
          radius={20}
          intensity="subtle"
          className="bg-white/30 p-6 dark:bg-white/[0.04]"
        >
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </LiquidGlass>
      ) : !transfer ? (
        <LiquidGlass
          radius={20}
          intensity="subtle"
          className="bg-white/30 p-6 dark:bg-white/[0.04]"
        >
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <p className="text-sm font-medium">Transfer tidak ditemukan</p>
            <Link href={LIST_HREF}>
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="mr-1.5 size-4" />
                Kembali
              </Button>
            </Link>
          </div>
        </LiquidGlass>
      ) : (
        <div className="flex flex-col gap-4">
          <LiquidGlass
            radius={20}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04]"
          >
            <div className="px-5 py-6">
              <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      No. Transfer Keluar
                    </Label>
                    <Input value={transfer.transfer_number} disabled />
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Lokasi Asal
                    </Label>
                    <Input
                      value={transfer.source_location?.location_name ?? "—"}
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Lokasi Tujuan
                    </Label>
                    <Input
                      value={transfer.destination_location?.location_name ?? "—"}
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Tanggal Kirim
                    </Label>
                    <Input value={formatDate(transfer.created_at)} disabled />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Diterima Oleh <span className="text-destructive">*</span>
                    </Label>
                    <UserSelect
                      value={receivedBy}
                      onChange={setReceivedBy}
                      defaultToSelf
                      placeholder="Nama penerima"
                    />
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                    <Label className="mt-2 text-sm font-medium text-muted-foreground">
                      Keterangan
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Masukkan keterangan disini"
                    />
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass
            radius={20}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04]"
          >
            <div className="px-5 py-4">
              <div className="mb-3">
                <SectionTitle>Daftar Produk</SectionTitle>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="border-b border-border/60 bg-muted/30">
                      <TableHead className="text-muted-foreground">Produk</TableHead>
                      <TableHead className="text-right text-muted-foreground">
                        Qty Transfer
                      </TableHead>
                      <TableHead className="text-center text-muted-foreground">
                        Qty Sisa
                      </TableHead>
                      <TableHead className="w-28 text-muted-foreground">
                        Qty Diterima
                      </TableHead>
                      <TableHead className="text-muted-foreground">Unit</TableHead>
                      <TableHead className="text-muted-foreground">
                        No. Serial/Batch
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Keterangan
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const remaining = item.qty - item.received_qty;
                      const row = itemQtys[item.id];
                      const currentQty = row?.qty ?? 0;
                      const variantOptions = (item.product?.options ?? [])
                        .map((o) => o.value)
                        .filter(Boolean)
                        .join(", ");
                      const productName =
                        item.product?.product?.name ?? item.product?.sku ?? "—";

                      return (
                        <TableRow key={item.id} className="border-b border-border/20">
                          <TableCell className="px-3 py-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{productName}</p>
                              {variantOptions && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {variantOptions}
                                </p>
                              )}
                              <p className="truncate font-mono text-2xs text-muted-foreground">
                                {item.product?.sku}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-3 text-right tabular-nums">
                            {item.qty}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center tabular-nums">
                            {remaining}
                          </TableCell>
                          <TableCell className="px-3 py-3">
                            {remaining > 0 ? (
                              <QtyConfirmInput
                                min={0}
                                max={remaining}
                                expected={remaining}
                                value={currentQty === 0 ? "" : currentQty}
                                onChange={(v) =>
                                  handleQtyChange(item.id, remaining, v)
                                }
                                onEnter={() => {
                                  if (canSubmit) handleSubmit();
                                }}
                                className="h-9 w-20 tabular-nums border-success/40 bg-success/10 focus-visible:ring-success/30"
                              />
                            ) : (
                              <span className="text-xs text-success">Lengkap</span>
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-muted-foreground">
                            Buah
                          </TableCell>
                          <TableCell className="px-3 py-3 font-mono text-xs text-muted-foreground">
                            {item.batch_no || item.serial_no || "—"}
                          </TableCell>
                          <TableCell className="px-3 py-3">
                            <Input
                              value={row?.notes ?? ""}
                              onChange={(e) =>
                                handleItemNoteChange(item.id, e.target.value)
                              }
                              placeholder="Catatan (opsional)"
                              className="h-9 min-w-[140px]"
                              disabled={remaining === 0}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </LiquidGlass>

          <div className="flex items-center justify-end gap-3">
            <Link href={LIST_HREF}>
              <Button variant="outline">
                <ArrowLeftIcon className="mr-1.5 size-4" />
                Batal
              </Button>
            </Link>
            <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
              {receiveMutation.isPending && (
                <Loader2Icon className="mr-1.5 size-4 animate-spin" />
              )}
              <PackageCheckIcon className="mr-1.5 size-4" />
              Simpan Penerimaan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
