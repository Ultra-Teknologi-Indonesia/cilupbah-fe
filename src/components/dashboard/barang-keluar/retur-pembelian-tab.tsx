"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useCallback } from "react";
import { useListState } from "@/hooks/use-list-state";
import { useRouter } from "next/navigation";
import {
  CornerUpLeftIcon,
  DownloadIcon,
  PlayIcon,
  Trash2Icon,
  } from "lucide-react";

import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DateRangePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { getStatusMeta } from "@/lib/status";
import {
  usePurchaseReturns,
  useProcessPurchaseReturn,
  useDeletePurchaseReturn,
} from "@/hooks/barang-keluar/use-purchase-returns";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { exportCsv } from "@/lib/export-csv";
import type { PurchaseReturn } from "@/types/barang-keluar/purchase-return";
import { formatDate, formatCurrency } from "@/lib/format";

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "COMPLETED", label: "Selesai" },
];

interface FilterState {
  status: string;
  location_id: string;
  date_from: string;
  date_to: string;
}

const EMPTY_FILTERS: FilterState = {
  status: "",
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

export function ReturPembelianTab() {
  const router = useRouter();
  const list = useListState<FilterState>(EMPTY_FILTERS, {
    perPage: 20,
    debounceMs: 350,
    namespace: "retur_beli",
  });

  const [processTarget, setProcessTarget] = useState<PurchaseReturn | null>(
    null,
  );
  const [processedBy, setProcessedBy] = useState("");
  const processMutation = useProcessPurchaseReturn();

  const [deleteTarget, setDeleteTarget] = useState<PurchaseReturn | null>(null);
  const deleteMutation = useDeletePurchaseReturn();

  const params = useMemo(
    () => ({
      search: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      "filter[status]": list.filters.status || undefined,
      "filter[location_id]": list.filters.location_id || undefined,
      "filter[date_from]": list.filters.date_from || undefined,
      "filter[date_to]": list.filters.date_to || undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters],
  );

  const dateRange: DateRange | undefined = useMemo(() => {
    const from = parseDateStr(list.filters.date_from);
    const to = parseDateStr(list.filters.date_to);
    if (!from && !to) return undefined;
    return { from, to };
  }, [list.filters.date_from, list.filters.date_to]);

  const { data, isLoading, isFetching } = usePurchaseReturns(params);
  const { data: locData } = useLocations({ perPage: 100 });

  const columns = useMemo<ColumnDef<PurchaseReturn>[]>(
    () => [
      {
        accessorKey: "return_number",
        header: "No. Retur",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.return_number}</span>
        ),
      },
      {
        id: "supplier",
        header: "Pemasok",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.supplier?.name ?? "—"}
          </span>
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
        accessorKey: "return_date",
        header: "Tgl. Retur",
        cell: ({ row }) => (
          <span className="text-foreground">
            {formatDate(row.original.return_date)}
          </span>
        ),
      },
      {
        accessorKey: "total_amount",
        header: "Total",
        cell: ({ row }) => (
          <span className="tabular-nums text-foreground">
            {formatCurrency(row.original.total_amount)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            domain="purchase-return"
            status={row.original.status}
            className="text-2xs leading-tight"
          />
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1">
                {item.status === "DRAFT" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setProcessTarget(item);
                        setProcessedBy("");
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2.5 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20"
                    >
                      <PlayIcon className="size-3.5" />
                      Proses
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
    ],
    [],
  );

  const items = useMemo(() => data?.items ?? [], [data?.items]);
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

  const handleExport = useCallback(() => {
    if (items.length === 0) return;
    exportCsv(
      "retur-pembelian.csv",
      [
        "No. Retur",
        "Pemasok",
        "Lokasi",
        "Tgl. Retur",
        "Total",
        "Status",
        "Dibuat Oleh",
      ],
      items.map((r: PurchaseReturn) => [
        r.return_number,
        r.supplier?.name ?? "",
        r.location?.location_name ?? "",
        r.return_date,
        String(r.total_amount),
        getStatusMeta("purchase-return", r.status).label,
        r.created_by,
      ]),
    );
  }, [items]);

  return (
    <>
      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <FilterToolbar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Cari no. retur, pemasok..."
          align="end"
          onReset={list.hasActiveFilter ? list.resetFilters : undefined}
          hasFilter={list.hasActiveFilter}
          activeCount={list.activeFilterCount}
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
            options={STATUS_OPTIONS}
            value={list.filters.status}
            onChange={(v) =>
              list.setFilters({ ...list.filters, status: v ?? "" })
            }
            placeholder="Status"
            searchPlaceholder="Cari status"
            className="h-9 bg-background"
          />
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
          <DateRangePicker
            value={dateRange}
            onChange={(range) =>
              list.setFilters({
                ...list.filters,
                date_from: toDateStr(range?.from),
                date_to: toDateStr(range?.to),
              })
            }
            placeholder="Rentang tanggal retur"
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
            onRowClick={(row) =>
              router.push(`/dashboard/barang-keluar/retur/${row.id}`)
            }
            pagination={list.pagination}
            rowCount={meta.total}
            onPaginationChange={list.onPaginationChange}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <EmptyState
                icon={CornerUpLeftIcon}
                title="Belum ada retur pembelian"
                description="Retur pembelian ke pemasok akan tampil di sini."
              />
            }
          />
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!processTarget}
        onOpenChange={(open) => {
          if (!open) setProcessTarget(null);
        }}
        title="Proses Retur Pembelian"
        description={`Proses retur ${processTarget?.return_number ?? ""}? Stok akan dikurangi sesuai item retur.`}
        confirmLabel="Proses"
        loading={processMutation.isPending}
        onConfirm={() => {
          if (!processTarget || !processedBy.trim()) return;
          processMutation.mutate(
            {
              id: processTarget.id,
              data: { processed_by: processedBy.trim() },
            },
            { onSuccess: () => setProcessTarget(null) },
          );
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="retur-processed-by" className="text-sm font-medium">
            Diproses oleh <span className="text-destructive">*</span>
          </Label>
          <UserSelect
            value={processedBy}
            onChange={setProcessedBy}
            defaultToSelf
            placeholder="Nama penanggung jawab"
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus Retur"
        description={`Hapus retur ${deleteTarget?.return_number ?? ""}? Aksi ini tidak bisa dibatalkan.`}
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
