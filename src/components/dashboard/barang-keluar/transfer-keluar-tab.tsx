"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeftIcon,
  DownloadIcon,
  CheckIcon,
  TruckIcon,
  XIcon,
  Trash2Icon, Loader2Icon } from "lucide-react";

import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DateRangePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { getStatusMeta } from "@/lib/status";
import {
  useOutboundDrafts,
  useOutboundTransit,
  useOutboundFinished,
  useApproveTransfer,
  useShipTransfer,
  useCancelTransfer,
  useDeleteTransfer,
} from "@/hooks/barang-keluar/use-outbound-transfers";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { useDebouncedSearch } from "@/hooks/shared/use-debounced-search";
import { exportCsv } from "@/lib/export-csv";
import type { InventoryTransfer } from "@/types/barang-masuk/inventory-transfer";
import { formatDate } from "@/lib/format";

type SubTab = "draft" | "transit" | "finished";

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "draft", label: "Baru Dibuat" },
  { key: "transit", label: "Sedang Dikirim" },
  { key: "finished", label: "Selesai" },
];

interface FilterState {
  location_id: string;
  date_from: string;
  date_to: string;
}

const EMPTY_FILTERS: FilterState = {
  location_id: "",
  date_from: "",
  date_to: "",
};

function toDateStr(d?: Date): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateStr(s: string): Date | undefined {
  if (!s) return undefined;
  return new Date(`${s}T00:00:00`);
}

function ProgressBar({ received, total }: { received: number; total: number }) {
  const pct = total > 0 ? Math.round((received / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 100 ? "bg-success" : "bg-warning",
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  );
}

function TransferTable({
  items,
  isLoading,
  isFetching,
  meta,
  page,
  perPage,
  setPage,
  setPerPage,
  resetPage,
  onRowClick,
  actionSlot,
}: {
  items: InventoryTransfer[];
  isLoading: boolean;
  isFetching: boolean;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  page: number;
  perPage: number;
  setPage: (p: number) => void;
  setPerPage: (s: number) => void;
  resetPage: () => void;
  onRowClick: (item: InventoryTransfer) => void;
  actionSlot?: (item: InventoryTransfer) => React.ReactNode;
}) {
  const columns = useMemo<ColumnDef<InventoryTransfer>[]>(
    () => [
      {
        accessorKey: "transfer_number",
        header: "No. Transfer",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.transfer_number}</span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Tanggal",
        cell: ({ row }) => (
          <span className="text-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "source_location",
        header: "Lokasi Asal",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.source_location?.location_name ?? "—"}
          </span>
        ),
      },
      {
        id: "destination_location",
        header: "Lokasi Tujuan",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.destination_location?.location_name ?? "—"}
          </span>
        ),
      },
      {
        id: "items_count",
        header: "Jumlah Item",
        cell: ({ row }) => (
          <span className="tabular-nums text-foreground">
            {row.original.items?.length ?? 0} item
          </span>
        ),
      },
      {
        id: "progress",
        header: "Progress",
        cell: ({ row }) => {
          const s = row.original.status;
          if (s !== "IN_TRANSIT" && s !== "RECEIVED") {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          const totalQty =
            row.original.items?.reduce(
              (s: number, i: { qty: number }) => s + i.qty,
              0,
            ) ?? 0;
          const recvQty =
            row.original.items?.reduce(
              (s: number, i: { received_qty?: number }) =>
                s + (i.received_qty ?? 0),
              0,
            ) ?? 0;
          return <ProgressBar received={recvQty} total={totalQty} />;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            domain="inventory-transfer"
            status={row.original.status}
            className="text-xs leading-tight"
          />
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              {actionSlot?.(row.original)}
            </div>
          );
        },
      },
    ],
    [actionSlot],
  );
  return (
    <>
      {isFetching && !isLoading && (
        <div className="flex justify-center py-1">
          <Loader2Icon className="size-4 animate-spin text-primary" />
        </div>
      )}

      <div className="px-5 py-5 sm:px-6">
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          hideToolbar
          manualPagination
          onRowClick={onRowClick}
          pagination={{
            pageIndex: page - 1,
            pageSize: perPage,
          }}
          rowCount={meta.total}
          onPaginationChange={(p) => {
            setPage(p.pageIndex + 1);
            setPerPage(p.pageSize);
          }}
          tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
          emptyState={
            <EmptyState icon={ArrowRightLeftIcon} title="Belum ada transfer keluar" description="Transfer antar lokasi yang keluar akan tampil di sini." />
          }
        />
      </div>
    </>
  );
}

export function TransferKeluarTab() {
  const router = useRouter();
  const [subTab, setSubTab] = useState<SubTab>("draft");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const [approveTarget, setApproveTarget] = useState<InventoryTransfer | null>(
    null,
  );
  const [approvedBy, setApprovedBy] = useState("");
  const approveMutation = useApproveTransfer();

  const [shipTarget, setShipTarget] = useState<InventoryTransfer | null>(null);
  const [shippedBy, setShippedBy] = useState("");
  const shipMutation = useShipTransfer();

  const [cancelTarget, setCancelTarget] = useState<InventoryTransfer | null>(
    null,
  );
  const [cancelledBy, setCancelledBy] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const cancelMutation = useCancelTransfer();

  const [deleteTarget, setDeleteTarget] = useState<InventoryTransfer | null>(
    null,
  );
  const deleteMutation = useDeleteTransfer();

  const resetPage = useCallback(() => setPage(1), []);
  const debouncedSearch = useDebouncedSearch(search, resetPage);

  const handleFilterChange = useCallback(
    (f: FilterState) => {
      setFilters(f);
      resetPage();
    },
    [resetPage],
  );

  const handleSubTabChange = useCallback((t: SubTab) => {
    setSubTab(t);
    setPage(1);
  }, []);

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      page,
      per_page: perPage,
      "filter[source_location_id]": filters.location_id || undefined,
      "filter[date_from]": filters.date_from || undefined,
      "filter[date_to]": filters.date_to || undefined,
    }),
    [debouncedSearch, page, perPage, filters],
  );

  const dateRange: DateRange | undefined = useMemo(() => {
    const from = parseDateStr(filters.date_from);
    const to = parseDateStr(filters.date_to);
    if (!from && !to) return undefined;
    return { from, to };
  }, [filters.date_from, filters.date_to]);

  const draftQuery = useOutboundDrafts(subTab === "draft" ? params : {});
  const transitQuery = useOutboundTransit(subTab === "transit" ? params : {});
  const finishedQuery = useOutboundFinished(
    subTab === "finished" ? params : {},
  );

  const activeQuery =
    subTab === "draft"
      ? draftQuery
      : subTab === "transit"
        ? transitQuery
        : finishedQuery;
  const items = activeQuery.data?.items ?? [];
  const meta = activeQuery.data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  };

  const { data: locData } = useLocations({ perPage: 100 });
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

  const hasActiveFilter = Object.values(filters).some(Boolean);
  const activeCount = Object.values(filters).filter(Boolean).length;

  const handleExport = useCallback(() => {
    if (items.length === 0) return;
    exportCsv(
      `transfer-keluar-${subTab}.csv`,
      [
        "No. Transfer",
        "Tanggal",
        "Lokasi Asal",
        "Lokasi Tujuan",
        "Jumlah Item",
        "Status",
      ],
      items.map((t: InventoryTransfer) => [
        t.transfer_number,
        t.created_at,
        t.source_location?.location_name ?? "",
        t.destination_location?.location_name ?? "",
        String(t.items?.length ?? 0),
        getStatusMeta("inventory-transfer", t.status).label,
      ]),
    );
  }, [items, subTab]);

  const handleRowClick = useCallback(
    (item: InventoryTransfer) => {
      router.push(`/dashboard/barang-keluar/transfer/${item.id}`);
    },
    [router],
  );

  const draftActions = useCallback(
    (item: InventoryTransfer) => (
      <div className="flex items-center gap-1">
        {(item.status === "DRAFT" || item.status === "APPROVED") && (
          <>
            {item.status === "DRAFT" && (
              <button
                type="button"
                onClick={() => {
                  setApproveTarget(item);
                  setApprovedBy("");
                }}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <CheckIcon className="size-3.5" />
                Approve
              </button>
            )}
            {item.status === "APPROVED" && (
              <button
                type="button"
                onClick={() => {
                  setShipTarget(item);
                  setShippedBy("");
                }}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <TruckIcon className="size-3.5" />
                Kirim
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setCancelTarget(item);
                setCancelReason("");
              }}
              className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning transition-colors hover:bg-warning/20"
            >
              <XIcon className="size-3.5" />
            </button>
            {item.status === "DRAFT" && (
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
              >
                <Trash2Icon className="size-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    ),
    [],
  );

  return (
    <>
      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <div className="px-4 pt-4 sm:px-5">
          <Tabs value={subTab} onValueChange={(val) => setSubTab(val as any)} className="flex flex-col gap-4">
            <TabsList variant="line" className="h-auto">
              {SUB_TABS.map(({ key, label }) => (
                <TabsTrigger key={key} value={key}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. transfer..."
          align="end"
          onReset={
            hasActiveFilter
              ? () => handleFilterChange(EMPTY_FILTERS)
              : undefined
          }
          hasFilter={hasActiveFilter}
          activeCount={activeCount}
          gridCols={2}
          leading={
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={items.length === 0}
            >
              <DownloadIcon className="mr-1.5 size-4" />
              Export CSV
            </Button>
          }
        >
          <Combobox
            options={locationOptions}
            value={filters.location_id}
            onChange={(v) =>
              handleFilterChange({ ...filters, location_id: v ?? "" })
            }
            placeholder="Lokasi Asal"
            searchPlaceholder="Cari lokasi"
            className="h-9 bg-background"
          />
          <DateRangePicker
            value={dateRange}
            onChange={(range) =>
              handleFilterChange({
                ...filters,
                date_from: toDateStr(range?.from),
                date_to: toDateStr(range?.to),
              })
            }
            placeholder="Rentang tanggal transfer"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        <TransferTable
          items={items}
          isLoading={activeQuery.isLoading}
          isFetching={activeQuery.isFetching}
          meta={meta}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          resetPage={resetPage}
          onRowClick={handleRowClick}
          actionSlot={subTab === "draft" ? draftActions : undefined}
        />
      </LiquidGlass>

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
        title="Approve Transfer"
        description={`Approve transfer ${approveTarget?.transfer_number ?? ""}?`}
        confirmLabel="Approve"
        loading={approveMutation.isPending}
        onConfirm={() => {
          if (!approveTarget || !approvedBy.trim()) return;
          approveMutation.mutate(
            { id: approveTarget.id, data: { approved_by: approvedBy.trim() } },
            { onSuccess: () => setApproveTarget(null) },
          );
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="tf-approved-by" className="text-sm font-medium">
            Disetujui oleh <span className="text-destructive">*</span>
          </Label>
          <UserSelect
            value={approvedBy}
            onChange={setApprovedBy}
            placeholder="Nama penyetuju"
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!shipTarget}
        onOpenChange={(open) => {
          if (!open) setShipTarget(null);
        }}
        title="Kirim Transfer"
        description={`Kirim transfer ${shipTarget?.transfer_number ?? ""}? Stok akan dikurangi dari lokasi asal.`}
        confirmLabel="Kirim"
        loading={shipMutation.isPending}
        onConfirm={() => {
          if (!shipTarget || !shippedBy.trim()) return;
          shipMutation.mutate(
            { id: shipTarget.id, data: { shipped_by: shippedBy.trim() } },
            { onSuccess: () => setShipTarget(null) },
          );
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="tf-shipped-by" className="text-sm font-medium">
            Dikirim oleh <span className="text-destructive">*</span>
          </Label>
          <UserSelect
            value={shippedBy}
            onChange={setShippedBy}
            defaultToSelf
            placeholder="Nama pengirim"
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelledBy("");
            setCancelReason("");
          }
        }}
        title="Batalkan Transfer"
        description={`Batalkan transfer ${cancelTarget?.transfer_number ?? ""}?`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancelMutation.isPending}
        onConfirm={() => {
          if (!cancelTarget || !cancelledBy.trim()) return;
          cancelMutation.mutate(
            {
              id: cancelTarget.id,
              data: {
                cancelled_by: cancelledBy.trim(),
                cancel_reason: cancelReason.trim() || undefined,
              },
            },
            {
              onSuccess: () => {
                setCancelTarget(null);
                setCancelledBy("");
                setCancelReason("");
              },
            },
          );
        }}
      >
        <div className="flex flex-col gap-3 px-1 py-2">
          <div>
            <Label htmlFor="tf-cancelled-by" className="text-sm font-medium">
              Dibatalkan oleh <span className="text-destructive">*</span>
            </Label>
            <UserSelect
              value={cancelledBy}
              onChange={setCancelledBy}
              defaultToSelf
              placeholder="Nama pembatal"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="tf-cancel-reason" className="text-sm font-medium">
              Alasan pembatalan
            </Label>
            <Input
              id="tf-cancel-reason"
              placeholder="Alasan (opsional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus Transfer"
        description={`Hapus draft transfer ${deleteTarget?.transfer_number ?? ""}? Aksi ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </>
  );
}
