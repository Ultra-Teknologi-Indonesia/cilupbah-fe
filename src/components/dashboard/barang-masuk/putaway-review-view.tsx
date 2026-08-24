"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PackageIcon,
  PrinterIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PenLineIcon,
  HistoryIcon,
} from "lucide-react";
import { RiwayatPenempatanDialog } from "./riwayat-penempatan-dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { usePutawayDetail } from "@/hooks/barang-masuk/use-putaway-actions";
import type { Putaway, PutawayItem } from "@/types/barang-masuk/putaway";
import { formatDateTime } from "@/lib/format";

interface PutawayReviewViewProps {
  id: string;
}

function itemPlacements(item: PutawayItem): { code: string; qty: number }[] {
  const apiPlacements = item.placements ?? [];
  if (apiPlacements.length > 0) {
    return apiPlacements.map((p) => ({
      code: p.bin?.bin_final_code ?? "—",
      qty: p.qty,
    }));
  }
  const destBin =
    item.destination_bin ??
    (item as unknown as { destinationBin?: { bin_final_code: string } })
      .destinationBin;
  if (destBin) {
    return [
      {
        code: destBin.bin_final_code,
        qty: item.putaway_qty > 0 ? item.putaway_qty : item.qty,
      },
    ];
  }
  const recBin =
    item.recommended_bin ??
    (item as unknown as { recommendedBin?: { bin_final_code: string } })
      .recommendedBin;
  if (recBin) {
    return [
      {
        code: recBin.bin_final_code,
        qty: item.qty,
      },
    ];
  }
  return [];
}

function sourceLabel(putaway: Putaway | null | undefined): string {
  if (!putaway) return "—";
  const fromSources = (putaway.sources ?? [])
    .map((s) => s.reference_number ?? s.transaction_number)
    .filter(Boolean)
    .join(", ");
  if (fromSources) return fromSources;
  return (
    putaway.inbound?.reference_number ??
    putaway.inbound?.transaction_number ??
    "—"
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
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}

export function PutawayReviewView({ id }: PutawayReviewViewProps) {
  const { data: putaway, isLoading } = usePutawayDetail(id);
  const [historyOpen, setHistoryOpen] = useState(false);

  const allItems = useMemo<PutawayItem[]>(
    () => putaway?.items ?? [],
    [putaway],
  );

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [didAutoExpand, setDidAutoExpand] = useState(false);
  const toggleExpand = (itemId: string) =>
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

  useEffect(() => {
    if (allItems.length > 0 && !didAutoExpand) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- auto-expand item saat data pertama tiba
      setExpandedItems(new Set(allItems.map((it) => it.id)));
      setDidAutoExpand(true);
    }
  }, [allItems, didAutoExpand]);

  const { totalQty, placedQty } = useMemo(
    () =>
      allItems.reduce(
        (acc, it) => {
          acc.totalQty += it.qty;
          acc.placedQty += it.putaway_qty;
          return acc;
        },
        { totalQty: 0, placedQty: 0 },
      ),
    [allItems],
  );
  const progressPct =
    totalQty > 0 ? Math.round((placedQty / totalQty) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={
          putaway ? `Penempatan - ${putaway.putaway_no}` : "Penempatan Barang"
        }
        backHref="/dashboard/barang-masuk/penempatan"
        breadcrumb={[
          { label: "Gudang", href: "/dashboard" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          {
            label: "Penempatan Barang",
            href: "/dashboard/barang-masuk/penempatan",
          },
          {
            label: putaway ? `Penempatan - ${putaway.putaway_no}` : "Memuat...",
          },
        ]}
        actions={
          putaway ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryOpen(true)}
                className="gap-1.5"
              >
                <HistoryIcon className="size-4 text-muted-foreground" />
                <span>Riwayat</span>
              </Button>

              {putaway.status === "COMPLETED" && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/barang-masuk/putaway/${putaway.id}`}>
                    <PenLineIcon className="mr-1.5 size-4" />
                    Koreksi Penempatan
                  </Link>
                </Button>
              )}
              {(putaway.status === "NOT_STARTED" ||
                putaway.status === "IN_PROGRESS") && (
                <Button asChild size="sm">
                  <Link href={`/dashboard/barang-masuk/putaway/${putaway.id}`}>
                    <PackageIcon className="mr-1.5 size-4" />
                    {putaway.status === "IN_PROGRESS"
                      ? "Lanjutkan Penempatan"
                      : "Mulai Penempatan"}
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="sm"
                aria-label="Cetak Putaway"
              >
                <Link
                  href={`/dashboard/document-preview/putaway/${putaway.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PrinterIcon className="mr-1.5 size-4" />
                  Cetak
                </Link>
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading ? (
        <LiquidGlass
          radius={20}
          intensity="subtle"
          className="bg-white/30 p-6 dark:bg-white/[0.04]"
        >
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </LiquidGlass>
      ) : !putaway ? (
        <LiquidGlass
          radius={20}
          intensity="subtle"
          className="bg-white/30 p-6 dark:bg-white/[0.04]"
        >
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <p className="text-sm font-medium">Putaway tidak ditemukan</p>
            <Link href="/dashboard/barang-masuk/penempatan">
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
            <div className="flex flex-col gap-5 px-5 py-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
                <InfoField label="No. Penempatan">
                  {putaway.putaway_no}
                </InfoField>
                <InfoField label="Status">
                  <StatusBadge domain="putaway" status={putaway.status} />
                </InfoField>
                <InfoField label="Lokasi">
                  {putaway.location?.location_name ?? "—"}
                </InfoField>
                <InfoField label="No. Penerimaan">
                  {sourceLabel(putaway)}
                </InfoField>
                <InfoField label="Dibuat Oleh">
                  {putaway.creator?.name ?? putaway.created_by}
                </InfoField>
                <InfoField label="Dikerjakan Oleh">
                  {putaway.assignee?.name ?? "—"}
                </InfoField>
                <InfoField label="Tgl. Mulai">
                  {formatDateTime(putaway.started_at)}
                </InfoField>
                <InfoField label="Tgl. Selesai">
                  {formatDateTime(putaway.completed_at)}
                </InfoField>
              </div>

              {putaway.notes && (
                <InfoField label="Keterangan">{putaway.notes}</InfoField>
              )}

              <div className="flex flex-col gap-1.5 border-t border-border/50 pt-4 sm:max-w-xs">
                <span className="text-sm font-semibold tabular-nums">
                  {placedQty} / {totalQty} Qty ditempatkan
                </span>
                <Progress
                  value={progressPct}
                  className={cn(
                    "h-2.5",
                    progressPct >= 100 &&
                      "[&_[data-slot=progress-indicator]]:bg-success",
                  )}
                />
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass
            radius={20}
            intensity="subtle"
            className="bg-white/30 dark:bg-white/[0.04]"
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Produk
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Sumber
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Kode Rak
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Qty
                  </TableHead>
                  <TableHead className="min-w-[150px] text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Keterangan
                  </TableHead>
                  <TableHead className="w-12 pr-5" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {allItems.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="py-16 text-center">
                      <p className="text-sm text-muted-foreground">
                        Tidak ada item pada penempatan ini.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  allItems.map((item) => (
                    <ReviewItemRow
                      key={item.id}
                      item={item}
                      sourceRef={sourceLabel(putaway)}
                      expanded={expandedItems.has(item.id)}
                      onToggleExpand={() => toggleExpand(item.id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </LiquidGlass>
        </div>
      )}

      <RiwayatPenempatanDialog
        putawayId={putaway?.id}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </div>
  );
}

interface ReviewItemRowProps {
  item: PutawayItem;
  sourceRef: string;
  expanded: boolean;
  onToggleExpand: () => void;
}

function ReviewItemRow({
  item,
  sourceRef,
  expanded,
  onToggleExpand,
}: ReviewItemRowProps) {
  const placements = useMemo(() => itemPlacements(item), [item]);
  const remaining = item.qty - item.putaway_qty;
  const done = remaining <= 0;

  const productName =
    item.product?.product?.name ?? item.variant?.item_name ?? "—";
  const variantOptions =
    item.product?.options?.map((o) => o.value).join(" / ") ??
    item.variant?.variation_values?.map((v) => v.value).join(" / ");
  const displayName = variantOptions
    ? `${productName} - ${variantOptions}`
    : productName;
  const displaySku = item.variant?.sku ?? item.product?.sku ?? "—";
  const imageUrl = item.product?.media?.[0]?.url;

  const firstBin = placements[0]?.code ?? "—";
  const multiBin = placements.length > 1;

  return (
    <>
      <TableRow
        className={cn(
          done && "bg-success/10",
          expanded && multiBin && "border-b-0",
        )}
      >
        <TableCell className="max-w-xs pl-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={displayName}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <PackageIcon className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-sm font-medium text-foreground"
                title={displayName}
              >
                {displayName}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {displaySku}
              </p>
            </div>
          </div>
        </TableCell>

        <TableCell>
          <span className="font-mono text-xs font-medium text-foreground">
            {sourceRef}
          </span>
        </TableCell>

        <TableCell className="max-w-[240px]">
          {placements.length === 0 ? (
            <span className="font-mono text-sm text-muted-foreground">—</span>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {placements.map((p, idx) => (
                <span
                  key={`${p.code}-${idx}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-xs font-medium text-foreground"
                >
                  <span>{p.code}</span>
                  {placements.length > 1 && (
                    <span className="text-2xs text-muted-foreground">
                      ({p.qty})
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </TableCell>

        <TableCell>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold tabular-nums">
              {item.putaway_qty} / {item.qty}
            </span>
            <span
              className={cn(
                "text-xs",
                done ? "font-medium text-success" : "text-muted-foreground",
              )}
            >
              {done
                ? "Selesai"
                : item.putaway_qty > 0
                  ? "ditempatkan sebagian"
                  : "belum ditempatkan"}
            </span>
          </div>
        </TableCell>

        <TableCell className="min-w-[150px]">
          {item.notes ? (
            <span className="text-xs text-foreground">{item.notes}</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>

        <TableCell className="pr-5">
          {multiBin ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onToggleExpand}
              className="text-muted-foreground"
              aria-label={expanded ? "Tutup detail rak" : "Lihat detail rak"}
            >
              {expanded ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ChevronRightIcon className="size-4" />
              )}
            </Button>
          ) : null}
        </TableCell>
      </TableRow>

      {expanded && multiBin && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={6} className="border-t-0 pb-4 pl-16 pr-5 pt-0">
            <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Rincian Rak
              </p>
              {placements.map((p, idx) => (
                <div
                  key={`${p.code}-${idx}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-mono font-medium text-foreground">
                    {p.code}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {p.qty} unit
                  </span>
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
