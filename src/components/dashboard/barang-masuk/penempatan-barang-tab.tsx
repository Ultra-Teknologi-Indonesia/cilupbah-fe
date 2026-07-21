"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useCallback } from "react";
import { useListState } from "@/hooks/use-list-state";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArchiveIcon,
  DownloadIcon,
  PrinterIcon,
  Trash2Icon,
  } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Progress } from "@/components/ui/progress";
import type { ColumnDef, Table as TableInstance } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePutaways } from "@/hooks/barang-masuk/use-putaway";
import {
  useDeletePutaway,
  useBulkDeletePutaway,
} from "@/hooks/barang-masuk/use-putaway-actions";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { exportCsv } from "@/lib/export-csv";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { getStatusMeta } from "@/lib/status";
import type { Putaway } from "@/types/barang-masuk/putaway";
import { formatDate } from "@/lib/format";

const BULK_PDF_MAX = 50;

function ProgressBar({ placed, total }: { placed: number; total: number }) {
  const pct = total > 0 ? Math.round((placed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} className="h-1.5 w-16" />
      <span className="text-xs tabular-nums text-muted-foreground">
        {placed} / {total}
      </span>
    </div>
  );
}

interface FilterState {
  status: string;
  location_id: string;
}

const EMPTY_FILTERS: FilterState = { status: "NOT_STARTED", location_id: "" };

function handleExportPutaway(items: Putaway[]) {
  const headers = [
    "No. Penempatan",
    "Tgl. Penempatan",
    "Lokasi",
    "Dibuat Oleh",
    "Dikerjakan Oleh",
    "Total Qty",
    "Qty Placed",
    "Status",
  ];
  const rows = items.map((item) => {
    const totalQty = item.items?.reduce((s, i) => s + i.qty, 0) ?? 0;
    const placedQty = item.items?.reduce((s, i) => s + i.putaway_qty, 0) ?? 0;
    return [
      item.putaway_no,
      item.started_at ?? item.created_at,
      item.location?.location_name ?? "",
      item.created_by,
      item.assignee?.name ?? "",
      String(totalQty),
      String(placedQty),
      getStatusMeta("putaway", item.status).label,
    ];
  });
  exportCsv(
    `penempatan-barang-${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

/** Aksi utama per baris menyesuaikan status: Mulai / Lanjutkan / Lihat. */
function primaryAction(item: Putaway): { label: string; href: string } {
  if (item.status === "COMPLETED") {
    return { label: "Lihat", href: `/dashboard/barang-masuk/penempatan/${item.id}` };
  }
  const href = `/dashboard/barang-masuk/putaway/${item.id}`;
  return item.status === "IN_PROGRESS"
    ? { label: "Lanjutkan", href }
    : { label: "Mulai", href };
}

function deleteDescription(p: Putaway | null): string {
  if (!p) return "";
  const no = p.putaway_no;
  switch (p.status) {
    case "NOT_STARTED":
      return `Hapus penempatan "${no}"? Dokumen dihapus dan penerimaan dikembalikan (data QC tetap tersimpan).`;
    case "IN_PROGRESS":
      return `Reset penempatan "${no}"? Semua stok yang sudah ditempatkan dikembalikan ke rak asal dan status kembali ke Belum Mulai.`;
    case "COMPLETED":
      return `Batalkan penyelesaian "${no}"? Semua stok dikembalikan dari rak dan status kembali ke Sedang Diproses.`;
    default:
      return `Hapus penempatan "${no}"?`;
  }
}

export function PenempatanBarangTab() {
  const router = useRouter();
  const list = useListState<FilterState>(EMPTY_FILTERS, {
    perPage: 20,
    debounceMs: 350,
    namespace: "penempatan",
  });
  const [deleteTarget, setDeleteTarget] = useState<Putaway | null>(null);
  const [bulkDeleteState, setBulkDeleteState] = useState<{
    ids: string[];
    onDone: () => void;
  } | null>(null);

  const deleteMut = useDeletePutaway();
  const bulkDeleteMut = useBulkDeletePutaway();

  const sortByStatus: Record<string, string> = {
    COMPLETED: "-completed_at",
    IN_PROGRESS: "-started_at",
  };

  const params = useMemo(
    () => ({
      search: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      "filter[status]": list.filters.status || undefined,
      "filter[location_id]": list.filters.location_id || undefined,
      sort: sortByStatus[list.filters.status] ?? undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters],
  );

  const { data, isLoading, isFetching } = usePutaways(params);
  const { data: locData } = useLocations({ perPage: 100 });

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

  const activeStatus = list.filters.status;

  const columns = useMemo<ColumnDef<Putaway>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Pilih semua"
          />
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Pilih baris"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 36,
      },
      {
        accessorKey: "putaway_no",
        header: "No. Penempatan",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.putaway_no}</span>
        ),
      },
      {
        id: "no_pembelian",
        header: "No. Penerimaan",
        cell: ({ row }) => {
          const sources = row.original.sources;
          const ref = sources?.[0]?.reference_number ?? row.original.inbound?.reference_number;
          return (
            <span className="text-foreground">{ref ?? "—"}</span>
          );
        },
      },
      {
        id: "tanggal",
        header:
          activeStatus === "COMPLETED"
            ? "Tgl. Selesai"
            : activeStatus === "IN_PROGRESS"
              ? "Tgl. Mulai"
              : "Tgl. Dibuat",
        cell: ({ row }) => {
          const r = row.original;
          const date =
            activeStatus === "COMPLETED"
              ? r.completed_at
              : activeStatus === "IN_PROGRESS"
                ? r.started_at
                : r.created_at;
          return (
            <span className="text-foreground">
              {date ? formatDate(date) : "—"}
            </span>
          );
        },
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
        accessorKey: "created_by",
        header: "Dibuat Oleh",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.creator?.name ?? row.original.created_by}
          </span>
        ),
      },
      {
        id: "assignee",
        header: "Dikerjakan Oleh",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.assignee?.name ?? "—"}
          </span>
        ),
      },
      {
        id: "progress",
        header: "Progress",
        cell: ({ row }) => {
          const totalQty =
            row.original.items?.reduce(
              (s: number, i: { qty: number }) => s + i.qty,
              0,
            ) ?? 0;
          const placedQty =
            row.original.items?.reduce(
              (s: number, i: { putaway_qty: number }) => s + i.putaway_qty,
              0,
            ) ?? 0;
          return <ProgressBar placed={placedQty} total={totalQty} />;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge domain="putaway" status={row.original.status} />
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => {
          const item = row.original;
          const action = primaryAction(item);
          return (
            <div
              className="flex items-center justify-end gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Button asChild variant="outline" size="sm">
                <Link href={action.href}>{action.label}</Link>
              </Button>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Cetak Putaway"
                    >
                      <Link
                        href={`/dashboard/document-preview/putaway/${item.id}`}
                      >
                        <PrinterIcon className="size-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cetak Laporan Putaway</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Hapus"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Hapus / Reset Penempatan</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      },
    ],
    [activeStatus],
  );

  const bulkActions = useCallback(
    (selected: Putaway[], table: TableInstance<Putaway>) => {
      const ids = selected.map((r) => r.id);
      const disablePdf = ids.length > BULK_PDF_MAX;
      return (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={disablePdf}
            onClick={() => {
              if (disablePdf) {
                toast.warning(`Maksimal ${BULK_PDF_MAX} dokumen per cetak`);
                return;
              }
              router.push(
                `/dashboard/document-preview/putaway-bulk/${ids.join(",")}`,
              );
            }}
            title={
              disablePdf
                ? `Maksimal ${BULK_PDF_MAX} dokumen per cetak`
                : undefined
            }
          >
            <PrinterIcon className="mr-1.5 size-4" />
            Cetak {ids.length}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() =>
              setBulkDeleteState({
                ids,
                onDone: () => table.resetRowSelection(),
              })
            }
          >
            <Trash2Icon className="mr-1.5 size-4" />
            Hapus {ids.length}
          </Button>
        </>
      );
    },
    [router],
  );

  return (
    <>
      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 sm:px-5">
          <Tabs
            value={list.filters.status || "ALL"}
            onValueChange={(val) =>
              list.setFilters({
                ...list.filters,
                status: val === "ALL" ? "" : val,
              })
            }
          >
            <TabsList variant="line" className="h-auto">
              <TabsTrigger value="NOT_STARTED">Belum Mulai</TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">Sedang Diproses</TabsTrigger>
              <TabsTrigger value="COMPLETED">Selesai</TabsTrigger>
              <TabsTrigger value="ALL">Semua</TabsTrigger>
            </TabsList>
          </Tabs>

          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportPutaway(items)}
            >
              <DownloadIcon className="mr-1.5 size-4" />
              Export CSV
            </Button>
          )}
        </div>

        <FilterToolbar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Cari no. penempatan..."
          align="end"
          onReset={list.hasActiveFilter ? list.resetFilters : undefined}
          hasFilter={list.hasActiveFilter}
          activeCount={list.activeFilterCount}
          gridCols={1}
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
        </FilterToolbar>

        <div className="px-5 py-5 sm:px-6">
          <DataTable
            columns={columns}
            data={items}
            isLoading={isLoading}
            isFetching={isFetching}
            hideToolbar
            manualPagination
            enableRowSelection
            getRowId={(row) => row.id}
            bulkActions={bulkActions}
            pagination={list.pagination}
            rowCount={meta.total}
            onPaginationChange={list.onPaginationChange}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <EmptyState icon={ArchiveIcon} title="Belum ada penempatan barang" description="Dokumen penempatan ke rak akan tampil di sini setelah
                    penerimaan." />
            }
          />
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus / Reset Penempatan"
        description={deleteDescription(deleteTarget)}
        confirmLabel={
          deleteTarget?.status === "NOT_STARTED" ? "Hapus" : "Reset"
        }
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMut.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />

      <ConfirmDialog
        open={!!bulkDeleteState}
        onOpenChange={(v) => !v && setBulkDeleteState(null)}
        title="Hapus Penempatan Terpilih"
        description={`Proses ${bulkDeleteState?.ids.length ?? 0} penempatan terpilih? Tiap dokumen di-revert sesuai statusnya (Belum Mulai dihapus, Sedang Diproses/Selesai direset & stok dikembalikan).`}
        confirmLabel="Proses"
        variant="destructive"
        loading={bulkDeleteMut.isPending}
        onConfirm={() => {
          if (!bulkDeleteState) return;
          bulkDeleteMut.mutate(bulkDeleteState.ids, {
            onSuccess: () => {
              bulkDeleteState.onDone();
              setBulkDeleteState(null);
            },
          });
        }}
      />
    </>
  );
}
