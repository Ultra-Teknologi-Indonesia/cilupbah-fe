"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PackageCheckIcon, DownloadIcon, LayersIcon } from "lucide-react";
import { BuatPenempatanManualDialog } from "./buat-penempatan-manual-dialog";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import { useInbounds } from "@/hooks/barang-masuk/use-inbound";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { exportCsv } from "@/lib/export-csv";
import type {
  Inbound,
  InboundStatus,
  InboundType,
} from "@/types/barang-masuk/inbound";

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Belum Mulai" },
  { value: "PARTIAL", label: "Sedang Diproses" },
  { value: "RECEIVED", label: "Selesai Diterima" },
  { value: "COMPLETED", label: "Selesai" },
];

const STATUS_STYLE: Record<string, string> = {
  DRAFT:
    "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  PARTIAL:
    "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
  RECEIVED:
    "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  PUTAWAY_IN_PROGRESS:
    "border-indigo-300 text-indigo-600 dark:border-indigo-500/30 dark:text-indigo-400",
  COMPLETED:
    "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED:
    "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Belum Mulai",
  PARTIAL: "Sebagian",
  RECEIVED: "Selesai Diterima",
  PUTAWAY_IN_PROGRESS: "Sedang Putaway",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const TYPE_LABEL: Record<string, string> = {
  PURCHASE_ORDER: "PO",
  TRANSIT_IN: "Transfer",
  SALES_RETURN: "Retur",
  CONSIGNMENT: "Konsinyasi",
};

const TYPE_STYLE: Record<string, string> = {
  PURCHASE_ORDER:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
  TRANSIT_IN:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400",
  SALES_RETURN:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400",
  CONSIGNMENT:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface FilterState {
  status: string;
  location_id: string;
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" };

function handleExportList(items: Inbound[]) {
  const headers = [
    "No. Penerimaan",
    "Sumber",
    "No. Referensi",
    "Tanggal",
    "Lokasi",
    "Dibuat Oleh",
    "Qty Diterima",
    "Status",
  ];
  const rows = items.map((item) => {
    const totalRecv = item.items?.reduce((s, i) => s + i.received_qty, 0) ?? 0;
    return [
      item.transaction_number,
      TYPE_LABEL[item.type] ?? item.type,
      item.reference_number ?? "",
      item.expected_date ?? item.created_at,
      item.location?.location_name ?? "",
      item.created_by,
      String(totalRecv),
      STATUS_LABEL[item.status] ?? item.status,
    ];
  });
  exportCsv(
    `penerimaan-barang-${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export function PenerimaanBarangTab() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const resetPage = useCallback(() => setPage(1), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      resetPage();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, resetPage]);

  const handleFilterChange = useCallback(
    (f: FilterState) => {
      setFilters(f);
      resetPage();
    },
    [resetPage],
  );

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      page,
      per_page: perPage,
      "filter[status]": filters.status || undefined,
      "filter[location_id]": filters.location_id || undefined,
    }),
    [debouncedSearch, page, perPage, filters],
  );

  const { data, isLoading, isFetching } = useInbounds(params);
  const { data: locData } = useLocations({ perPage: 100 });

  const [penempatanTarget, setPenempatanTarget] = useState<Inbound | null>(
    null,
  );

  const columns = useMemo<ColumnDef<Inbound>[]>(
    () => [
      {
        accessorKey: "transaction_number",
        header: "No. Penerimaan",
        cell: ({ row }) => (
          <span className="font-medium text-primary underline-offset-2 hover:underline">
            {row.original.transaction_number}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Sumber",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] leading-tight",
              TYPE_STYLE[row.original.type] ?? "",
            )}
          >
            {TYPE_LABEL[row.original.type] ?? row.original.type}
          </Badge>
        ),
      },
      {
        accessorKey: "reference_number",
        header: "No. Referensi",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.reference_number ?? "—"}
          </span>
        ),
      },
      {
        id: "tanggal",
        header: "Tanggal",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.expected_date
              ? formatDate(row.original.expected_date)
              : formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "location",
        header: "Lokasi",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.location?.location_name ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "created_by",
        header: "Dibuat Oleh",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.created_by}
          </span>
        ),
      },
      {
        id: "qty",
        header: "Qty Diterima",
        cell: ({ row }) => {
          const totalExpected =
            row.original.items?.reduce(
              (s: number, i: any) => s + (i.expected_qty || 0),
              0,
            ) ?? 0;
          const totalRecv =
            row.original.items?.reduce(
              (s: number, i: any) => s + (i.received_qty || 0),
              0,
            ) ?? 0;
          return (
            <span className="tabular-nums text-muted-foreground">
              {totalRecv} / {totalExpected}
            </span>
          );
        },
      },
      {
        id: "progress_penempatan",
        header: "Progress Penempatan",
        cell: ({ row }) => {
          const totalRecv = row.original.items?.reduce((s, i) => s + i.received_qty, 0) ?? 0;
          const totalPutaway = row.original.items?.reduce((s, i) => s + i.putaway_qty, 0) ?? 0;
          return (
            <span className="text-muted-foreground">
              {totalPutaway} / {totalRecv}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] leading-tight",
              STATUS_STYLE[row.original.status] ?? "",
            )}
          >
            {STATUS_LABEL[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "dikerjakan",
        header: "Dikerjakan",
        cell: ({ row }) => {
          const worker = row.original.assignments?.[0]?.worker?.name;
          return <span className="text-muted-foreground">{worker ?? "—"}</span>;
        }
      },
      {
        accessorKey: "notes",
        header: "Keterangan",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.notes ?? "—"}</span>
        )
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
          const item = row.original;
          const isAssigned = item.assignments && item.assignments.length > 0;
          if (!["COMPLETED", "CANCELLED"].includes(item.status) && !isAssigned) {
            return (
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  setPenempatanTarget(item);
                }}
              >
                <LayersIcon className="h-4 w-4" />
                Penempatan
              </Button>
            );
          }
          return null;
        },
      },
    ],
    [],
  );

  const items = data?.items ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
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

  const hasActiveFilter = Object.values(filters).some(Boolean);
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        {items.length > 0 && (
          <div className="flex justify-end px-4 pt-3 sm:px-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportList(items)}
            >
              <DownloadIcon className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        )}
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. penerimaan..."
          align="end"
          onReset={
            hasActiveFilter
              ? () => handleFilterChange(EMPTY_FILTERS)
              : undefined
          }
          hasFilter={hasActiveFilter}
          activeCount={activeCount}
          gridCols={2}
        >
          <Combobox
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(v) =>
              handleFilterChange({ ...filters, status: v ?? "" })
            }
            placeholder="Status"
            searchPlaceholder="Cari status"
            className="h-9 bg-background"
          />
          <Combobox
            options={locationOptions}
            value={filters.location_id}
            onChange={(v) =>
              handleFilterChange({ ...filters, location_id: v ?? "" })
            }
            placeholder="Lokasi"
            searchPlaceholder="Cari lokasi"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        {isFetching && !isLoading && (
          <div className="flex justify-center py-1">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        <div className="px-5 py-5 sm:px-6">
          <DataTable
            columns={columns}
            data={items}
            isLoading={isLoading}
            hideToolbar
            manualPagination
            onRowClick={(row) =>
              router.push(`/dashboard/barang-masuk/penerimaan/${row.id}`)
            }
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
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <PackageCheckIcon className="h-10 w-10 opacity-20" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Belum ada penerimaan barang
                  </p>
                  <p className="mt-1 text-xs">
                    Dokumen penerimaan dari PO, Transfer, atau Retur akan tampil
                    di sini.
                  </p>
                </div>
              </div>
            }
          />
        </div>
      </LiquidGlass>

      <BuatPenempatanManualDialog
        inbound={penempatanTarget}
        open={!!penempatanTarget}
        onOpenChange={(open) => {
          if (!open) setPenempatanTarget(null);
        }}
      />
    </>
  );
}
