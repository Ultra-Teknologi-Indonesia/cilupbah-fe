"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useCallback } from "react";
import { useListState } from "@/hooks/use-list-state";
import { useUrlTab } from "@/hooks/use-url-tab";
import Link from "next/link";
import { CornerDownLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlagIcon,
  PlusIcon, Loader2Icon, RefreshCwIcon, DownloadIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import {
  useSalesReturnsUnprocessed,
  useSalesReturns,
} from "@/hooks/barang-masuk/use-sales-returns";
import {
  useAcceptSalesReturn,
  useRejectSalesReturn,
  useCompleteSalesReturn,
  useSyncReturnTracking,
  useSyncReturnDetail,
} from "@/hooks/barang-masuk/use-sales-return-actions";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import type { SalesReturn } from "@/types/barang-masuk/sales-return";

// eslint-disable-next-line no-restricted-imports
import { SalesReturnService } from "@/services/barang-masuk/sales-return.service";
import { DateRangePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { formatDate, formatDateTime } from "@/lib/format";

type ReturSubTab = "unprocessed" | "rejected" | "accepted" | "completed";

const SUB_TABS: { key: ReturSubTab; label: string }[] = [
  { key: "unprocessed", label: "Barang Retur" },
  { key: "rejected", label: "Ditolak" },
  { key: "accepted", label: "Disetujui" },
  { key: "completed", label: "Selesai" },
];

const SUBTAB_TO_STATUS: Record<ReturSubTab, string> = {
  unprocessed: "",
  rejected: "REJECTED",
  accepted: "ACCEPTED",
  completed: "COMPLETED",
};

const REASON_CATEGORY_OPTIONS = [
  { value: "", label: "Semua Kategori" },
  { value: "FAILED_DELIVERY", label: "Gagal Kirim" },
  { value: "COMPLAINT", label: "Komplain Pembeli" },
  { value: "CANCEL_SHIPPED", label: "Cancel Telanjur Kirim" },
  { value: "REMORSE", label: "Berubah Pikiran" },
  { value: "OTHER", label: "Lainnya" },
];

interface FilterState {
  location_id: string;
  reason_category: string;
}

const EMPTY_FILTERS: FilterState = { location_id: "", reason_category: "" };

export function ReturChannelTab() {
  const [subTab, setSubTab] = useUrlTab<ReturSubTab>("tab", "unprocessed", {
    validValues: ["unprocessed", "rejected", "accepted", "completed"],
  });
  const list = useListState<FilterState>(EMPTY_FILTERS, {
    perPage: 20,
    debounceMs: 350,
    namespace: "retur_channel",
  });

  const [acceptTarget, setAcceptTarget] = useState<SalesReturn | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SalesReturn | null>(null);
  const [completeTarget, setCompleteTarget] = useState<SalesReturn | null>(
    null,
  );
  const [processedBy, setProcessedBy] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const [approvedQty, setApprovedQty] = useState<Record<string, number>>({});

  const [exportRange, setExportRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [isExporting, setIsExporting] = useState(false);

  const acceptMutation = useAcceptSalesReturn();
  const rejectMutation = useRejectSalesReturn();
  const completeMutation = useCompleteSalesReturn();
  const syncTrackingMutation = useSyncReturnTracking();
  const syncDetailMutation = useSyncReturnDetail();

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await SalesReturnService.exportChannelOnline({
        date_from: exportRange?.from
          ? format(exportRange.from, "yyyy-MM-dd")
          : undefined,
        date_to: exportRange?.to
          ? format(exportRange.to, "yyyy-MM-dd")
          : undefined,
        location_id: list.filters.location_id || undefined,
      });
      toast.success("File Excel berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh file Excel");
    } finally {
      setIsExporting(false);
    }
  }, [exportRange, list.filters.location_id]);

  const handleSubTabChange = useCallback(
    (t: ReturSubTab) => {
      setSubTab(t);
      list.setPage(1);
    },
    [setSubTab, list],
  );

  const isUnprocessed = subTab === "unprocessed";
  const statusFilter = SUBTAB_TO_STATUS[subTab];

  const params = useMemo(
    () => ({
      search: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      "filter[status]": statusFilter || undefined,
      "filter[location_id]": list.filters.location_id || undefined,
      "filter[reason_category]": list.filters.reason_category || undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, statusFilter, list.filters],
  );

  const unprocessedQuery = useSalesReturnsUnprocessed(
    isUnprocessed ? params : {},
  );
  const listQuery = useSalesReturns(!isUnprocessed ? params : {});

  const activeQuery = isUnprocessed ? unprocessedQuery : listQuery;
  const { data, isLoading, isFetching } = activeQuery;
  const { data: locData } = useLocations({ perPage: 100 });

  const columns = useMemo<ColumnDef<SalesReturn>[]>(() => {
    const cols: ColumnDef<SalesReturn>[] = [
      {
        accessorKey: "return_number",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="No. Retur" />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <Link
            href={`/dashboard/barang-masuk/retur/${row.original.id}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {row.original.return_number}
          </Link>
        ),
      },
      {
        accessorKey: "source",
        header: "Sumber",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.source === "marketplace" ? "Marketplace" : "Manual"}
          </Badge>
        ),
      },
      {
        accessorKey: "return_tracking_number",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="No. Resi Retur" />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const item = row.original;
          const isSyncing =
            syncTrackingMutation.isPending &&
            syncTrackingMutation.variables === item.id;
          return (
            <div className="flex items-center gap-1.5">
              <div className="flex min-w-0 flex-col">
                <span className="font-medium tabular-nums text-foreground">
                  {item.return_tracking_number ?? "—"}
                </span>
                {item.return_carrier && (
                  <span className="truncate text-xs text-muted-foreground">
                    {item.return_carrier}
                  </span>
                )}
              </div>
              {item.source === "marketplace" && (
                <button
                  type="button"
                  title="Sinkron resi dari marketplace"
                  disabled={isSyncing}
                  onClick={() => syncTrackingMutation.mutate(item.id)}
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <RefreshCwIcon
                    className={cn("size-3.5", isSyncing && "animate-spin")}
                  />
                </button>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "marketplace_decision",
        header: "Keputusan MP",
        cell: ({ row }) => {
          const item = row.original;
          if (item.source !== "marketplace") {
            return <span className="text-muted-foreground">—</span>;
          }
          const isSyncing =
            syncDetailMutation.isPending &&
            syncDetailMutation.variables === item.id;
          return (
            <div className="flex items-center gap-1.5">
              <StatusBadge
                domain="sales-return-marketplace-decision"
                status={item.marketplace_decision}
              />
              <button
                type="button"
                title="Sinkron keputusan marketplace"
                disabled={isSyncing}
                onClick={() => syncDetailMutation.mutate(item.id)}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <RefreshCwIcon
                  className={cn("size-3.5", isSyncing && "animate-spin")}
                />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "refund_amount",
        header: () => <span className="block text-right">Refund</span>,
        cell: ({ row }) => {
          const amount = row.original.refund_amount;
          return (
            <div className="text-right tabular-nums text-foreground">
              {amount != null
                ? new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(amount)
                : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "customer_name",
        header: "Pelanggan",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.customer_name ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "reason",
        header: "Alasan",
        cell: ({ row }) => (
          <div className="max-w-[160px] truncate text-muted-foreground">
            {row.original.reason ?? "—"}
          </div>
        ),
      },
      {
        accessorKey: "reason_category",
        header: "Kategori Alasan",
        cell: ({ row }) => (
          <StatusBadge
            domain="sales-return-reason-category"
            status={row.original.reason_category}
          />
        ),
      },
      {
        id: "location",
        header: "Lokasi",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.location?.location_name ?? "—"}
          </span>
        ),
      },
      {
        id: "qty",
        header: "Qty",
        cell: ({ row }) => {
          const totalQty =
            row.original.items?.reduce((s, i) => s + i.qty, 0) ?? 0;
          return (
            <span className="tabular-nums text-muted-foreground">
              {totalQty}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tgl. Retur" />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-foreground whitespace-nowrap text-xs">
            {formatDateTime(row.original.created_at)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge domain="sales-return" status={row.original.status} />
        ),
      },
    ];

    if (isUnprocessed) {
      cols.push({
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAcceptTarget(item);
                  setProcessedBy("");
                }}
                className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20"
              >
                <CheckCircleIcon className="size-3.5" />
                Setujui
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(item);
                  setProcessedBy("");
                  setRejectReason("");
                }}
                className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
              >
                <XCircleIcon className="size-3.5" />
                Tolak
              </button>
            </div>
          );
        },
      });
    } else if (subTab === "accepted") {
      cols.push({
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setCompleteTarget(item);
                  setProcessedBy("");
                }}
                className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20"
              >
                <FlagIcon className="size-3.5" />
                Selesaikan
              </button>
            </div>
          );
        },
      });
    }

    return cols;
  }, [isUnprocessed, subTab, syncTrackingMutation, syncDetailMutation]);

  const items = data?.items ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: list.perPage,
    total: 0,
  };

  const locationOptions = useMemo(
    () => [
      { value: "", label: "Semua Lokasi" },
      ...(locData?.items ?? []).map((l) => ({
        value: l.id,
        label: l.locationName,
      })),
    ],
    [locData],
  );

  return (
    <div className="flex flex-col gap-3">
      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4 sm:px-6">
          <Tabs value={subTab} onValueChange={(val) => handleSubTabChange(val as ReturSubTab)} className="flex flex-col gap-4">
            <TabsList variant="line" className="h-auto">
              {SUB_TABS.map(({ key, label }) => (
                <TabsTrigger key={key} value={key}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={isExporting}
              onClick={handleExport}
            >
              {isExporting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <DownloadIcon className="size-4" />
              )}
              Unduh Excel
            </Button>
            <Button size="sm" asChild className="gap-1.5">
              <Link href="/dashboard/barang-masuk/retur/buat">
                <PlusIcon className="size-4" />
                Buat Retur
              </Link>
            </Button>
          </div>
        </div>

        <FilterToolbar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Cari no. resi, no. pesanan, no. retur, pelanggan..."
          align="end"
          onReset={
            list.hasActiveFilter || !!list.search
              ? list.resetAll
              : undefined
          }
          hasFilter={list.hasActiveFilter || !!list.search}
          activeCount={list.activeFilterCount}
          gridCols={3}
        >
          <Combobox
            options={locationOptions}
            value={list.filters.location_id}
            onChange={(v) =>
              list.setFilters({ ...list.filters, location_id: v ?? "" })
            }
            placeholder="Lokasi"
            searchPlaceholder="Cari lokasi"
            className="h-9 bg-background"
          />
          <Combobox
            options={REASON_CATEGORY_OPTIONS}
            value={list.filters.reason_category}
            onChange={(v) =>
              list.setFilters({ ...list.filters, reason_category: v ?? "" })
            }
            placeholder="Kategori Alasan"
            searchPlaceholder="Cari kategori"
            className="h-9 bg-background"
          />
          <DateRangePicker
            value={exportRange}
            onChange={setExportRange}
            placeholder="Rentang unduh"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        <div className="px-5 py-5 sm:px-6">
          <DataTable
            columns={columns}
            data={items}
            isLoading={isLoading}
            isFetching={isFetching}
            hideToolbar
            manualPagination
            pagination={list.pagination}
            rowCount={meta.total}
            onPaginationChange={list.onPaginationChange}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <EmptyState icon={CornerDownLeftIcon} title="Belum ada retur" description="Retur dari channel online akan tampil di sini." />
            }
          />
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!acceptTarget}
        onOpenChange={(open) => {
          if (!open) {
            setAcceptTarget(null);
            setApprovedQty({});
          }
        }}
        title="Setujui Retur"
        description={`Setujui retur ${acceptTarget?.return_number ?? ""}? Qty yang disetujui akan langsung diterima dan siap ditempatkan.`}
        confirmLabel="Setujui"
        loading={acceptMutation.isPending}
        onConfirm={() => {
          if (!acceptTarget || !processedBy.trim()) return;
          const items = acceptTarget.items.map((it) => ({
            item_id: it.item_id,
            approved_qty: approvedQty[it.item_id] ?? it.qty,
          }));
          acceptMutation.mutate(
            { id: acceptTarget.id, processed_by: processedBy.trim(), items },
            {
              onSuccess: () => {
                setAcceptTarget(null);
                setApprovedQty({});
              },
            },
          );
        }}
      >
        <div className="space-y-4 px-1 py-2">
          <div>
            <Label htmlFor="accept-by" className="text-sm font-medium">
              Diproses oleh <span className="text-destructive">*</span>
            </Label>
            <UserSelect
              value={processedBy}
              onChange={setProcessedBy}
              defaultToSelf
              placeholder="Nama petugas"
              className="mt-1.5"
            />
          </div>

          {acceptTarget && acceptTarget.items.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Qty disetujui</Label>
              <div className="mt-1.5 space-y-2">
                {acceptTarget.items.map((it) => {
                  const current = approvedQty[it.item_id] ?? it.qty;
                  return (
                    <div
                      key={it.id}
                      className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {it.product?.product?.name ??
                            it.product?.sku ??
                            it.item_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {it.product?.sku ?? "—"} · diretur {it.qty}
                        </p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={it.qty}
                        value={current}
                        onChange={(e) => {
                          const raw = Number(e.target.value);
                          const clamped = Number.isNaN(raw)
                            ? 0
                            : Math.max(0, Math.min(raw, it.qty));
                          setApprovedQty((prev) => ({
                            ...prev,
                            [it.item_id]: clamped,
                          }));
                        }}
                        className="w-20 text-right"
                      />
                      <span className="text-xs text-muted-foreground">
                        / {it.qty}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!completeTarget}
        onOpenChange={(open) => {
          if (!open) setCompleteTarget(null);
        }}
        title="Selesaikan Retur"
        description={`Tandai retur ${completeTarget?.return_number ?? ""} sebagai selesai? Pastikan barang sudah diterima kembali ke stok.`}
        confirmLabel="Selesaikan"
        loading={completeMutation.isPending}
        onConfirm={() => {
          if (!completeTarget || !processedBy.trim()) return;
          completeMutation.mutate(
            { id: completeTarget.id, processed_by: processedBy.trim() },
            { onSuccess: () => setCompleteTarget(null) },
          );
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="complete-by" className="text-sm font-medium">
            Diproses oleh <span className="text-destructive">*</span>
          </Label>
          <UserSelect
            value={processedBy}
            onChange={setProcessedBy}
            defaultToSelf
            placeholder="Nama petugas"
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
        title="Tolak Retur"
        description={`Tolak retur ${rejectTarget?.return_number ?? ""}?`}
        confirmLabel="Tolak"
        variant="destructive"
        loading={rejectMutation.isPending}
        onConfirm={() => {
          if (!rejectTarget || !processedBy.trim()) return;
          rejectMutation.mutate(
            {
              id: rejectTarget.id,
              processed_by: processedBy.trim(),
              reason: rejectReason.trim() || undefined,
            },
            { onSuccess: () => setRejectTarget(null) },
          );
        }}
      >
        <div className="flex flex-col gap-3 px-1 py-2">
          <div>
            <Label htmlFor="reject-by" className="text-sm font-medium">
              Diproses oleh <span className="text-destructive">*</span>
            </Label>
            <UserSelect
              value={processedBy}
              onChange={setProcessedBy}
              defaultToSelf
              placeholder="Nama petugas"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="reject-reason" className="text-sm font-medium">
              Alasan penolakan
            </Label>
            <Input
              id="reject-reason"
              placeholder="Alasan (opsional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
