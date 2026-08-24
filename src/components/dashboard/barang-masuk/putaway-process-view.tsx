"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeftIcon,
  Loader2Icon,
  ScanLineIcon,
  QrCodeIcon,
  PackageIcon,
  Trash2Icon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/dashboard/page-title";
import {
  ScanAutoflowBar,
  type ScanAutoflowLine,
} from "@/components/dashboard/shared/scan-autoflow-bar";
import { QtyConfirmInput } from "@/components/ui/qty-confirm-input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  usePutawayDetail,
  usePutawayItems,
  useProcessPutawayItem,
  useCompletePutaway,
  useDeletePutawayPlacement,
  usePutawayBins,
  useUnassignPutaway,
  useResetPutawayAssignment,
  useUpdatePutawayItemNotes,
  type BinListItem,
} from "@/hooks/barang-masuk/use-putaway-actions";
import { useSetReceivedQty } from "@/hooks/barang-masuk/use-inbound";
import { InlineQtyEdit } from "@/components/dashboard/barang-masuk/inline-qty-edit";
import type { PutawayItem } from "@/types/barang-masuk/putaway";
import {
  AssignmentLockBanner,
  ResetAssignmentDialog,
  UnassignReasonDialog,
} from "@/components/shared/channel-lock";
import { useMe } from "@/hooks/auth/use-auth";
import { useUserLookup } from "@/hooks/pengaturan/use-users";

interface PutawayProcessViewProps {
  id: string;
}

interface PlacementEntry {
  id: string;
  initialSavedQty: number;
  initialBinCode: string;
  initialBinQty: number;
  maxQty: number;

  committedPlacementId?: string;
}

export function PutawayProcessView({ id }: PutawayProcessViewProps) {
  const {
    data: putaway,
    isLoading,
    refetch: refetchDetail,
  } = usePutawayDetail(id);
  const { data: items, refetch: refetchItems } = usePutawayItems(id);

  const router = useRouter();
  const [activeRack, setActiveRack] = useState<BinListItem | null>(null);
  const prevStatusRef = useRef(putaway?.status);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = putaway?.status;
    if (prev === "IN_PROGRESS" && putaway?.status === "COMPLETED") {
      toast.success("Penempatan otomatis selesai — semua kuota terpenuhi");
      router.push(`/dashboard/barang-masuk/penempatan/${id}`);
    }
  }, [putaway?.status, id, router]);

  const [notes, setNotes] = useState("");
  const [scanError, setScanError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [itemPlacements, setItemPlacements] = useState<
    Record<string, PlacementEntry[]>
  >({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [didAutoExpand, setDidAutoExpand] = useState(false);
  const [scannedItemIds, setScannedItemIds] = useState<Set<string>>(new Set());
  const [focusPlacementId, setFocusPlacementId] = useState<string | null>(null);
  const [scanFocusKey, setScanFocusKey] = useState(0);
  const refocusScan = useCallback(() => setScanFocusKey((k) => k + 1), []);

  const locationId = putaway?.location_id ?? "";

  const [prevNotes, setPrevNotes] = useState(putaway?.notes);
  if (putaway?.notes !== prevNotes) {
    setPrevNotes(putaway?.notes);
    if (putaway?.notes != null) setNotes(putaway.notes);
  }

  const isNotStarted = putaway?.status === "NOT_STARTED";
  const isInProgress = putaway?.status === "IN_PROGRESS";
  const isCompleted = putaway?.status === "COMPLETED";

  const canEdit = isNotStarted || isInProgress;

  const { data: me } = useMe();

  const [unassignOpen, setUnassignOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const unassignMutation = useUnassignPutaway(id);
  const resetMutation = useResetPutawayAssignment(id);

  const [completeOpen, setCompleteOpen] = useState(false);
  const completeMutation = useCompletePutaway();

  const staffQuery = useUserLookup({
    role: "putaway",
    perPage: 50,
  });
  const staffOptions = useMemo(
    () =>
      (staffQuery.data?.items ?? [])
        .filter((u) => u.id !== putaway?.assigned_to)
        .map((u) => ({ id: u.id, name: u.name })),
    [staffQuery.data, putaway?.assigned_to],
  );

  const allItems = useMemo<PutawayItem[]>(() => items ?? [], [items]);

  const visibleList = useMemo(
    () =>
      allItems.filter((it) => it.putaway_qty > 0 || scannedItemIds.has(it.id)),
    [allItems, scannedItemIds],
  );

  useEffect(() => {
    if (allItems.length > 0 && !didAutoExpand) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedItems(new Set(allItems.map((it) => it.id)));
      setDidAutoExpand(true);
    }
  }, [allItems, didAutoExpand]);

  const { totalQty, placedQty } = useMemo(() => {
    return allItems.reduce(
      (acc, it) => {
        acc.totalQty += it.qty;
        acc.placedQty += it.putaway_qty;
        return acc;
      },
      { totalQty: 0, placedQty: 0 },
    );
  }, [allItems]);
  const progressPct =
    totalQty > 0 ? Math.round((placedQty / totalQty) * 100) : 0;

  const incompleteItems = useMemo(
    () => allItems.filter((it) => it.qty - it.putaway_qty > 0),
    [allItems],
  );

  const { data: availableBins = [] } = usePutawayBins(locationId);

  const binOptions = useMemo(
    () =>
      availableBins.map((b) => ({
        value: b.id,
        label: b.bin_final_code,
      })),
    [availableBins],
  );

  const handleSelectRack = useCallback(
    (binId: string | null) => {
      const bin = binId
        ? (availableBins.find((b) => b.id === binId) ?? null)
        : null;
      setActiveRack(bin);
      if (bin) refocusScan();
    },
    [availableBins, refocusScan],
  );

  const addPlacementForItem = useCallback((match: PutawayItem) => {
    setScanError("");

    const newId = `${match.id}-p-${Date.now()}`;
    const newEntry: PlacementEntry = {
      id: newId,
      initialSavedQty: 0,
      initialBinCode: "",
      initialBinQty: 0,
      maxQty: match.qty - match.putaway_qty,
    };

    setItemPlacements((prev) => {
      const existing = prev[match.id];
      if (existing) {
        return { ...prev, [match.id]: [...existing, newEntry] };
      }
      const entries: PlacementEntry[] = [];
      const apiPlacements = match.placements ?? [];
      if (apiPlacements.length > 0) {
        for (const p of apiPlacements) {
          entries.push({
            id: `${match.id}-existing-${p.bin_id}`,
            initialSavedQty: p.qty,
            initialBinCode: p.bin?.bin_final_code ?? "",
            initialBinQty: p.qty,
            maxQty: match.qty,
          });
        }
      } else if (match.putaway_qty > 0 && match.destination_bin) {
        entries.push({
          id: `${match.id}-existing`,
          initialSavedQty: match.putaway_qty,
          initialBinCode: match.destination_bin.bin_final_code,
          initialBinQty: match.putaway_qty,
          maxQty: match.qty,
        });
      }
      entries.push(newEntry);
      return { ...prev, [match.id]: entries };
    });

    setExpandedItems((prev) => new Set(prev).add(match.id));
    setFocusPlacementId(newId);
  }, []);

  const scanLines = useMemo<ScanAutoflowLine[]>(
    () =>
      allItems
        .filter((it) => isCompleted || it.qty - it.putaway_qty > 0)
        .map((it) => {
          const sku = it.variant?.sku ?? it.product?.sku ?? "—";
          const opts =
            it.product?.options?.map((o) => o.value).join(" / ") ??
            it.variant?.variation_values?.map((v) => v.value).join(" / ");
          return {
            id: it.id,
            primary:
              it.product?.product?.name ?? (opts ? `${sku} — ${opts}` : sku),
            secondary: opts ? `${sku} · ${opts}` : sku,
            imageUrl: it.product?.media?.[0]?.url,
            codes: [
              it.variant?.sku,
              it.product?.sku,
              it.serial_no,
              it.batch_no,
            ].filter(Boolean) as string[],
            done: it.qty - it.putaway_qty <= 0,
          };
        }),
    [allItems, isCompleted],
  );

  const handleResolve = useCallback(
    (line: ScanAutoflowLine) => {
      const match = allItems.find((it) => it.id === line.id);
      if (!match) return;
      if (match.qty - match.putaway_qty <= 0) {
        setScanError("Item ini sudah selesai ditempatkan.");
        return;
      }
      setScannedItemIds((prev) => new Set(prev).add(match.id));
      addPlacementForItem(match);
    },
    [allItems, addPlacementForItem],
  );

  const onProcessed = useCallback(() => {
    refetchItems();
    refetchDetail();
    setTimeout(() => refetchDetail(), 1500);
  }, [refetchItems, refetchDetail]);

  const handleScanSaved = useCallback(() => {
    refocusScan();
  }, [refocusScan]);

  const handleQtyCorrected = useCallback(() => {
    refetchItems();
    refetchDetail();
  }, [refetchItems, refetchDetail]);

  const toggleExpand = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const removePlacement = useCallback((itemId: string, placementId: string) => {
    setItemPlacements((prev) => {
      const list = prev[itemId]?.filter((p) => p.id !== placementId);
      if (!list || list.length === 0) {
        const { [itemId]: __, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: list };
    });
  }, []);

  const allSelectable = useMemo(
    () => visibleList.map((it) => it.id),
    [visibleList],
  );
  const allChecked =
    allSelectable.length > 0 && allSelectable.every((i) => selectedIds.has(i));
  const someChecked = allSelectable.some((i) => selectedIds.has(i));

  const toggleAll = useCallback(() => {
    setSelectedIds(allChecked ? new Set() : new Set(allSelectable));
  }, [allChecked, allSelectable]);

  const toggleOne = useCallback((itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const statusLabel = isNotStarted
    ? "Belum Mulai"
    : isInProgress
      ? "Sedang Diproses"
      : isCompleted
        ? "Selesai"
        : (putaway?.status ?? "");

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
          ...(statusLabel ? [{ label: statusLabel }] : []),
          {
            label: putaway ? `Penempatan - ${putaway.putaway_no}` : "Memuat...",
          },
        ]}
      />

      {putaway && (
        <AssignmentLockBanner
          assignedToName={putaway.assignee?.name ?? null}
          assignedAt={putaway.assigned_at ?? null}
          isUnlockedOnce={putaway.completed_at != null}
          status={putaway.status}
          mode="advisory"
          onUnassign={() => setUnassignOpen(true)}
          onReset={() => setResetOpen(true)}
          canUnassign={!!putaway.assigned_to}
          canReset={!!putaway.assigned_to}
        />
      )}

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <aside className="flex w-full flex-col gap-5 lg:sticky lg:top-4 lg:w-64 lg:shrink-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Kode Rak
              </p>
              <p className="mt-1.5 text-lg font-bold text-foreground">
                {activeRack ? activeRack.bin_final_code : "Belum dipilih"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <ScanLineIcon className="size-4 text-muted-foreground" />
                <div className="text-sm font-medium">Pilih Rak</div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Pilih rak tujuan penempatan berikutnya.
              </p>
              <div className="mt-3 flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-3">
                {activeRack ? (
                  <QRCodeSVG value={activeRack.bin_final_code} size={72} />
                ) : (
                  <QrCodeIcon
                    className="h-8 w-8 text-muted-foreground/60"
                    strokeWidth={1.2}
                  />
                )}
              </div>
              <Combobox
                options={binOptions}
                value={activeRack?.id ?? null}
                onChange={handleSelectRack}
                placeholder="Pilih rak…"
                searchPlaceholder="Cari kode rak…"
                emptyText="Tidak ada rak tersedia."
                disabled={!canEdit}
                className="mt-3 rounded-xl"
              />
            </div>

            <div>
              <Label
                htmlFor="putaway-notes"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Keterangan
              </Label>
              <Textarea
                id="putaway-notes"
                placeholder="Masukkan keterangan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isCompleted}
                className="mt-1.5 min-h-28 rounded-lg text-sm"
              />
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <LiquidGlass
              radius={20}
              intensity="subtle"
              className="bg-white/30 dark:bg-white/[0.04]"
            >
              <div className="flex flex-col gap-4 px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <ScanAutoflowBar
                    lines={scanLines}
                    onResolve={handleResolve}
                    interceptCode={(code) => {
                      const n = code.trim().toLowerCase().replace(/\s+/g, "");
                      const rack = availableBins.find(
                        (b) =>
                          b.bin_final_code
                            .trim()
                            .toLowerCase()
                            .replace(/\s+/g, "") === n,
                      );
                      if (rack) {
                        handleSelectRack(rack.id);
                        return true;
                      }
                      return false;
                    }}
                    disabled={!canEdit}
                    refocusKey={scanFocusKey}
                    hint="Scan rak tujuan → scan SKU/serial/batch → isi qty (keyboard hanya qty)."
                    className="flex-1"
                  />
                  <div className="flex min-w-44 flex-col gap-1.5 lg:w-56">
                    <span className="flex items-center gap-2 text-sm font-semibold tabular-nums">
                      {placedQty} / {totalQty} Qty
                    </span>
                    <Progress
                      value={Math.min(progressPct, 100)}
                      className={cn(
                        "h-2.5",
                        progressPct >= 100 &&
                          "[&_[data-slot=progress-indicator]]:bg-success",
                      )}
                    />
                  </div>
                </div>
                {scanError && (
                  <p className="-mt-1 text-xs text-destructive">{scanError}</p>
                )}
                {isInProgress && incompleteItems.length > 0 && (
                  <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-2.5">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-warning" />
                    <p className="text-xs text-foreground">
                      {incompleteItems.length} item masih ada selisih (fisik
                      kurang dari data). Kalau fisiknya memang tidak ada,
                      koreksi qty diterima lewat ikon pensil di kolom Qty —
                      selisihnya otomatis dicatat sebagai Penyesuaian Stok.
                    </p>
                  </div>
                )}
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
                    <TableHead className="w-10 pl-5">
                      <Checkbox
                        checked={
                          allChecked
                            ? true
                            : someChecked
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={toggleAll}
                        disabled={!canEdit || allSelectable.length === 0}
                        aria-label="Pilih semua"
                      />
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Produk
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Sumber
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Qty
                    </TableHead>
                    <TableHead className="min-w-[180px] text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Keterangan
                    </TableHead>
                    <TableHead className="w-12 pr-5" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleList.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="py-16 text-center">
                        <p className="text-sm text-muted-foreground">
                          Scan kode rak terlebih dahulu, lalu scan SKU produk.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleList.map((item) => (
                      <PutawayItemRow
                        key={item.id}
                        item={item}
                        putawayId={id}
                        locationId={locationId}
                        editable={canEdit}
                        correctable={isInProgress || isCompleted}
                        defaultRack={activeRack}
                        binOptions={binOptions}
                        availableBins={availableBins}
                        selected={selectedIds.has(item.id)}
                        onToggleSelect={() => toggleOne(item.id)}
                        onProcessed={onProcessed}
                        sourceRef={
                          putaway?.inbound?.reference_number ??
                          putaway?.inbound?.transaction_number ??
                          "—"
                        }
                        placements={itemPlacements[item.id] ?? []}
                        expanded={expandedItems.has(item.id)}
                        onToggleExpand={() => toggleExpand(item.id)}
                        focusPlacementId={focusPlacementId}
                        onRemovePlacement={(pid) =>
                          removePlacement(item.id, pid)
                        }
                        onSaved={handleScanSaved}
                        onQtyCorrected={handleQtyCorrected}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </LiquidGlass>

            {isInProgress && (
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => setCompleteOpen(true)}
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <CheckCircle2Icon className="size-4" />
                  )}
                  Selesaikan Penempatan
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Selesaikan penempatan?"
        description={
          incompleteItems.length > 0
            ? `Masih ada ${incompleteItems.length} item yang belum penuh. Sisa kuota akan dirilis dan tersedia untuk penempatan baru. Setelah selesai, admin masih bisa mengoreksi qty penempatan.`
            : "Setelah selesai, admin masih bisa mengoreksi qty penempatan. Selisih koreksi otomatis tercatat sebagai Penyesuaian Stok."
        }
        confirmLabel="Selesaikan"
        loading={completeMutation.isPending}
        onConfirm={() =>
          completeMutation.mutate(id, {
            onSuccess: () => setCompleteOpen(false),
          })
        }
      />

      <UnassignReasonDialog
        open={unassignOpen}
        onOpenChange={setUnassignOpen}
        isSubmitting={unassignMutation.isPending}
        onSubmit={(payload) => unassignMutation.mutateAsync(payload)}
        staff={staffOptions}
        staffLoading={staffQuery.isLoading}
        currentUserId={me?.id}
      />

      <ResetAssignmentDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        isSubmitting={resetMutation.isPending}
        destructiveDescription="Semua penempatan yang sudah masuk rak akan dibongkar dan stok dikembalikan ke Bin Inbound. Dokumen kembali ke status NOT_STARTED."
        onSubmit={(payload) => resetMutation.mutateAsync(payload)}
        staff={staffOptions}
        staffLoading={staffQuery.isLoading}
        currentUserId={me?.id}
      />
    </div>
  );
}

interface PutawayItemRowProps {
  item: PutawayItem;
  putawayId: string;
  locationId: string;
  editable: boolean;
  correctable: boolean;
  defaultRack: BinListItem | null;
  binOptions: { value: string; label: string; hint?: string }[];
  availableBins: BinListItem[];
  selected: boolean;
  onToggleSelect: () => void;
  onProcessed: () => void;
  sourceRef: string;
  placements: PlacementEntry[];
  expanded: boolean;
  onToggleExpand: () => void;
  focusPlacementId: string | null;
  onRemovePlacement: (id: string) => void;
  onSaved?: () => void;
  onQtyCorrected?: () => void;
}

function ItemNotesInput({
  putawayId,
  itemId,
  initialNotes,
  disabled,
}: {
  putawayId: string;
  itemId: string;
  initialNotes?: string | null;
  disabled?: boolean;
}) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const updateNotesMut = useUpdatePutawayItemNotes();

  useEffect(() => {
    setNotes(initialNotes ?? "");
  }, [initialNotes]);

  const handleBlur = () => {
    const trimmed = notes.trim() || null;
    const prevTrimmed = (initialNotes ?? "").trim() || null;
    if (trimmed !== prevTrimmed) {
      updateNotesMut.mutate({
        putawayId,
        itemId,
        notes: trimmed,
      });
    }
  };

  return (
    <Input
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      placeholder="Catatan koreksi SKU / reject…"
      disabled={disabled || updateNotesMut.isPending}
      className="h-8 w-full min-w-[150px] max-w-[240px] text-xs bg-background/60 focus-visible:bg-background"
    />
  );
}

function PutawayItemRow({
  item,
  putawayId,
  locationId: _locationId,
  editable,
  correctable,
  defaultRack,
  binOptions,
  availableBins,
  selected,
  onToggleSelect,
  onProcessed,
  sourceRef,
  placements,
  expanded,
  onToggleExpand,
  focusPlacementId,
  onRemovePlacement,
  onSaved,
  onQtyCorrected,
}: PutawayItemRowProps) {
  const remaining = item.qty - item.putaway_qty;
  const done = remaining <= 0;

  const effectivePlacements = useMemo(() => {
    if (placements.length > 0) return placements;
    const apiPlacements = item.placements ?? [];
    if (apiPlacements.length > 0) {
      return apiPlacements.map((p) => ({
        id: p.id,
        committedPlacementId: p.id,
        initialSavedQty: p.qty,
        initialBinCode: p.bin?.bin_final_code ?? "",
        initialBinQty: p.qty,
        maxQty: item.qty,
      }));
    }
    const destBin =
      item.destination_bin ??
      (item as unknown as { destinationBin?: { bin_final_code: string } })
        .destinationBin;
    if (destBin) {
      return [
        {
          id: "auto",
          initialSavedQty: item.putaway_qty,
          initialBinCode: destBin.bin_final_code,
          initialBinQty: item.putaway_qty,
          maxQty: item.qty,
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
          id: "rec",
          initialSavedQty: item.putaway_qty,
          initialBinCode: recBin.bin_final_code,
          initialBinQty: item.putaway_qty,
          maxQty: item.qty,
        },
      ];
    }
    return [];
  }, [
    placements,
    item.placements,
    item.putaway_qty,
    item.destination_bin,
    item.recommended_bin,
    item.qty,
  ]);

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

  return (
    <>
      <TableRow
        data-state={selected ? "selected" : undefined}
        className={cn(
          done && "bg-success/10",
          expanded && effectivePlacements.length > 0 && "border-b-0",
        )}
      >
        <TableCell className="pl-5">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelect}
            disabled={!editable}
            aria-label="Pilih item"
          />
        </TableCell>

        <TableCell className="max-w-xs">
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
              {(item.recommended_bin ||
                item.destination_bin ||
                effectivePlacements.length > 0) && (
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  {effectivePlacements.length > 0 ? (
                    effectivePlacements.map((p, idx) => (
                      <span
                        key={`${p.id}-${idx}`}
                        className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-2xs font-medium text-foreground"
                      >
                        <span>Rak: {p.initialBinCode || "—"}</span>
                        {p.initialSavedQty > 0 && (
                          <span className="text-muted-foreground">
                            ({p.initialSavedQty})
                          </span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-2xs font-medium text-foreground">
                      Rak:{" "}
                      {
                        (item.recommended_bin ?? item.destination_bin)
                          ?.bin_final_code
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <span className="font-mono text-xs font-medium text-foreground">
            {sourceRef}
          </span>
        </TableCell>

        <TableCell>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tabular-nums">
                {item.putaway_qty} / {item.qty}
              </span>
            </div>
            {editable && (item.inbound_sources?.length ?? 0) > 0 && (
              <InlineSourceQtyEditors
                sources={item.inbound_sources ?? []}
                onCorrected={onQtyCorrected}
              />
            )}
            <span
              className={cn(
                "text-xs",
                done ? "text-success font-medium" : "text-muted-foreground",
              )}
            >
              {done
                ? "Selesai"
                : item.putaway_qty > 0
                  ? "ditempatkan"
                  : "belum ditempatkan"}
            </span>
          </div>
        </TableCell>

        <TableCell className="min-w-[180px]">
          <ItemNotesInput
            putawayId={putawayId}
            itemId={item.id}
            initialNotes={item.notes}
            disabled={!editable}
          />
        </TableCell>

        <TableCell className="pr-5">
          {effectivePlacements.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onToggleExpand}
              className="text-muted-foreground"
              aria-label={expanded ? "Tutup detail" : "Lihat detail"}
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

      {expanded && effectivePlacements.length > 0 && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={6} className="border-t-0 pb-4 pl-16 pr-5 pt-0">
            <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Detail Penempatan
              </p>
              {effectivePlacements.map((entry) => (
                <PlacementRow
                  key={entry.id}
                  item={item}
                  putawayId={putawayId}
                  defaultRack={defaultRack}
                  binOptions={binOptions}
                  availableBins={availableBins}
                  editable={editable}
                  correctable={correctable}
                  onProcessed={onProcessed}
                  entry={entry}
                  focusTarget={
                    focusPlacementId === entry.id
                      ? defaultRack
                        ? "qty"
                        : null
                      : null
                  }
                  onSaved={onSaved}
                  onRemove={
                    placements.length > 0 &&
                    !entry.id.endsWith("-existing") &&
                    entry.id !== "auto"
                      ? () => onRemovePlacement(entry.id)
                      : undefined
                  }
                />
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

interface PlacementRowProps {
  item: PutawayItem;
  putawayId: string;
  defaultRack: BinListItem | null;
  binOptions: { value: string; label: string; hint?: string }[];
  availableBins: BinListItem[];
  editable: boolean;
  correctable: boolean;
  onProcessed: () => void;
  entry: PlacementEntry;
  focusTarget: "qty" | null;
  onSaved?: () => void;
  onRemove?: () => void;
}

function PlacementRow({
  item,
  putawayId,
  defaultRack,
  binOptions,
  availableBins,
  editable,
  correctable,
  onProcessed,
  entry,
  focusTarget,
  onSaved,
  onRemove,
}: PlacementRowProps) {
  const processMutation = useProcessPutawayItem();
  const deletePlacementMutation = useDeletePutawayPlacement();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const binLocked = !!(item.recommended_bin_locked && item.recommended_bin);

  const initialBinId = useMemo(() => {
    if (binLocked) return item.recommended_bin!.id;
    if (defaultRack) return defaultRack.id;
    if (entry.initialBinCode) {
      const match = availableBins.find(
        (b) => b.bin_final_code === entry.initialBinCode,
      );
      if (match) return match.id;
    }
    if (item.recommended_bin) return item.recommended_bin.id;
    return null;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedBinId, setSelectedBinId] = useState<string | null>(
    initialBinId,
  );
  const [qty, setQty] = useState(
    entry.initialBinQty > 0
      ? String(entry.initialBinQty)
      : entry.maxQty > 0
        ? String(entry.maxQty)
        : "",
  );
  const [hasSaved, setHasSaved] = useState(entry.initialBinQty > 0);

  const qtyInputRef = useRef<HTMLInputElement>(null);
  const lastSavedQty = useRef(entry.initialSavedQty);

  const selectedBin = useMemo(
    () =>
      selectedBinId
        ? (availableBins.find((b) => b.id === selectedBinId) ?? null)
        : null,
    [selectedBinId, availableBins],
  );

  useEffect(() => {
    if (focusTarget === "qty") {
      setTimeout(() => qtyInputRef.current?.focus(), 50);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/refs
  const lastSaved = lastSavedQty.current;

  const saveNow = useCallback(
    (binId: string, targetQty: number, afterSave?: () => void) => {
      const delta = targetQty - lastSavedQty.current;
      if (delta <= 0 || processMutation.isPending) return;
      processMutation.mutate(
        {
          putawayId,
          itemId: item.id,
          payload: { destination_bin_id: binId, qty: delta },
        },
        {
          onSuccess: () => {
            lastSavedQty.current = targetQty;
            setHasSaved(true);
            onProcessed();
            afterSave?.();
          },
        },
      );
    },
    [processMutation, putawayId, item.id, onProcessed],
  );

  const handleSave = useCallback(() => {
    if (!selectedBinId || processMutation.isPending) return;
    const qtyNum = parseInt(qty) || 0;
    if (qtyNum > lastSavedQty.current) saveNow(selectedBinId, qtyNum, onSaved);
  }, [selectedBinId, qty, processMutation.isPending, saveNow, onSaved]);

  const handleSelectBin = useCallback(
    (binId: string | null) => {
      if (binLocked) return;
      setSelectedBinId(binId);
      if (binId) setTimeout(() => qtyInputRef.current?.focus(), 50);
    },
    [binLocked],
  );

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col gap-1">
        <Combobox
          options={binOptions}
          value={selectedBinId}
          onChange={handleSelectBin}
          placeholder="Pilih rak…"
          searchPlaceholder="Cari kode rak…"
          emptyText="Tidak ada rak."
          disabled={!editable || binLocked}
          className={cn(
            "h-8 w-52 rounded-lg text-xs",
            binLocked && "opacity-80",
            selectedBin && "border-success ring-1 ring-success/30",
          )}
        />
        {binLocked && (
          <p className="text-[10px] text-muted-foreground">
            Rak terkunci (1 SKU = 1 rak)
          </p>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <QtyConfirmInput
            inputRef={qtyInputRef}
            min={1}
            max={entry.maxQty}
            expected={entry.maxQty}
            value={qty === "" ? "" : Number(qty)}
            disabled={!editable}
            onChange={(v) => setQty(v === "" ? "" : String(v))}
            onEnter={handleSave}
            placeholder="0"
            className="h-8 w-20 tabular-nums text-xs"
          />
          {editable && !hasSaved ? (
            <Button
              type="button"
              size="sm"
              disabled={
                !selectedBinId ||
                processMutation.isPending ||
                (parseInt(qty) || 0) <= lastSaved
              }
              onClick={handleSave}
              className="h-8 px-3 text-xs"
            >
              {processMutation.isPending ? (
                <Loader2Icon className="mr-1 size-3.5 animate-spin" />
              ) : null}
              Simpan
            </Button>
          ) : processMutation.isPending ? (
            <Loader2Icon className="size-3.5 animate-spin text-warning" />
          ) : hasSaved ? (
            <CheckCircle2Icon className="size-3.5 text-success" />
          ) : null}
        </div>
        {(() => {
          const qtyNum = parseInt(qty) || 0;
          return qtyNum > entry.maxQty ? (
            <p className="text-amber-600 text-xs">
              Melebihi data sistem (tersedia: {entry.maxQty}) — akan tercatat
              minus
            </p>
          ) : null;
        })()}
      </div>

      {onRemove && editable && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Hapus penempatan"
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      )}

      {entry.committedPlacementId && correctable && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={deletePlacementMutation.isPending}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label="Koreksi penempatan"
          >
            {deletePlacementMutation.isPending ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <Trash2Icon className="size-3.5" />
            )}
          </Button>

          <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Koreksi Penempatan</DialogTitle>
                <DialogDescription>
                  Hapus penempatan {entry.initialSavedQty} unit di rak{" "}
                  <span className="font-mono font-medium">
                    {entry.initialBinCode || "—"}
                  </span>
                  ? Stok akan dikembalikan ke rak asal dan qty penempatan item
                  ini berkurang.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmDeleteOpen(false)}
                  disabled={deletePlacementMutation.isPending}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  disabled={deletePlacementMutation.isPending}
                  onClick={() =>
                    deletePlacementMutation.mutate(
                      {
                        putawayId,
                        itemId: item.id,
                        placementId: entry.committedPlacementId!,
                      },
                      {
                        onSuccess: () => {
                          setConfirmDeleteOpen(false);
                          onProcessed();
                        },
                      },
                    )
                  }
                >
                  {deletePlacementMutation.isPending
                    ? "Mengoreksi…"
                    : "Ya, Koreksi"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function InlineSourceQtyEditors({
  sources,
  onCorrected,
}: {
  sources: NonNullable<PutawayItem["inbound_sources"]>;
  onCorrected?: () => void;
}) {
  if (sources.length === 1) {
    return (
      <InlineSourceQtyEditor source={sources[0]} onCorrected={onCorrected} />
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {sources.map((source) => (
        <div key={source.inbound_item_id} className="flex items-center gap-1.5">
          <span
            className="max-w-24 truncate font-mono text-[11px] text-muted-foreground"
            title={source.transaction_number ?? undefined}
          >
            {source.transaction_number ?? "—"}
          </span>
          <InlineSourceQtyEditor source={source} onCorrected={onCorrected} />
        </div>
      ))}
    </div>
  );
}

function InlineSourceQtyEditor({
  source,
  onCorrected,
}: {
  source: NonNullable<PutawayItem["inbound_sources"]>[number];
  onCorrected?: () => void;
}) {
  const mutation = useSetReceivedQty(source.inbound_id);

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>diterima</span>
      <InlineQtyEdit
        value={source.received_qty}
        minQty={source.putaway_qty}
        saving={mutation.isPending}
        onSave={(qty) =>
          mutation.mutate(
            {
              itemId: source.inbound_item_id,
              qty,
              expectedUpdatedAt: source.updated_version_at,
            },
            { onSuccess: () => onCorrected?.() },
          )
        }
      />
    </span>
  );
}
