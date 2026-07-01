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
import { Progress } from "@/components/ui/progress";
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

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "muted" | "info" | "indigo"> = {
  DRAFT: "muted",
  PARTIAL: "warning",
  RECEIVED: "info",
  PUTAWAY_IN_PROGRESS: "indigo",
  COMPLETED: "success",
  CANCELLED: "destructive",
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

const TYPE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "muted" | "info" | "indigo" | "purple" | "orange" | "teal"> = {
  PURCHASE_ORDER: "info",
  TRANSIT_IN: "purple",
  SALES_RETURN: "orange",
  CONSIGNMENT: "teal",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} className="h-1.5 w-16" />
      <span className="text-xs tabular-nums text-muted-foreground">{value} / {total}</span>
    </div>
  )
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
  const [perPage, setPerPage] = useState(20);
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
          <Badge variant={TYPE_VARIANT[row.original.type] ?? "default"}>
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
        id: "progress_penempatan",
        header: "Progress Penempatan",
        cell: ({ row }) => {
          const totalRecv = row.original.items?.reduce((s, i) => s + i.received_qty, 0) ?? 0;
          const totalPutaway = row.original.items?.reduce((s, i) => s + i.putaway_qty, 0) ?? 0;
          return (
            <ProgressBar value={totalPutaway} total={totalRecv} />
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status] ?? "default"}>
            {STATUS_LABEL[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "dikerjakan",
        header: "Dikerjakan",
        cell: ({ row }) => {
          const worker = row.original.putaways?.[0]?.assignee?.name;
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
          const hasActivePutaway = item.putaways && item.putaways.some(p => !["COMPLETED", "CANCELLED"].includes(p.status));
          const totalRecv = item.items?.reduce((s, i) => s + (i.received_qty || 0), 0) ?? 0;
          const totalPutaway = item.items?.reduce((s, i) => s + (i.putaway_qty || 0), 0) ?? 0;

          if (!["COMPLETED", "CANCELLED"].includes(item.status) && !hasActivePutaway && totalRecv > 0 && totalPutaway < totalRecv) {
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
