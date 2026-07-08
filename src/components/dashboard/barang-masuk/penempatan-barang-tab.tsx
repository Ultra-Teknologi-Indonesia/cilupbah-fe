"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArchiveIcon,
  DownloadIcon,
  PrinterIcon,
  Loader2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Progress } from "@/components/ui/progress";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePutaways } from "@/hooks/barang-masuk/use-putaway";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { exportCsv } from "@/lib/export-csv";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { getStatusMeta } from "@/lib/status";
import type { Putaway } from "@/types/barang-masuk/putaway";
import { formatDate } from "@/lib/format";

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

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" };

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

export function PenempatanBarangTab() {
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

  const { data, isLoading, isFetching } = usePutaways(params);
  const { data: locData } = useLocations({ perPage: 100 });

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

  const columns = useMemo<ColumnDef<Putaway>[]>(
    () => [
      {
        accessorKey: "putaway_no",
        header: "No. Penempatan",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.putaway_no}</span>
        ),
      },
      {
        id: "no_pembelian",
        header: "No. Pembelian",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.inbound?.reference_number ?? "—"}
          </span>
        ),
      },
      {
        id: "tanggal",
        header: "Tgl. Pembelian",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.inbound?.created_at
              ? formatDate(row.original.inbound.created_at)
              : "—"}
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
        header: "Aksi",
        cell: ({ row }) => {
          const item = row.original;
          // Menu Penempatan = monitoring saja. Proses assign/penempatan
          // dilakukan dari menu Penerimaan Barang.
          return (
            <div className="flex items-center gap-1.5">
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
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PrinterIcon className="size-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cetak Laporan Putaway</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      },
    ],
    [],
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
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 sm:px-5">
          <Tabs
            value={filters.status || "ALL"}
            onValueChange={(val) =>
              handleFilterChange({
                ...filters,
                status: val === "ALL" ? "" : val,
              })
            }
          >
            <TabsList variant="line" className="h-auto">
              <TabsTrigger value="ALL">Semua</TabsTrigger>
              <TabsTrigger value="NOT_STARTED">Belum Mulai</TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">Proses</TabsTrigger>
              <TabsTrigger value="COMPLETED">Selesai</TabsTrigger>
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
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. penempatan..."
          align="end"
          onReset={
            hasActiveFilter
              ? () => handleFilterChange(EMPTY_FILTERS)
              : undefined
          }
          hasFilter={hasActiveFilter}
          activeCount={activeCount}
          gridCols={1}
        >
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
              <EmptyState icon={ArchiveIcon} title="Belum ada penempatan barang" description="Dokumen penempatan ke rak akan tampil di sini setelah
                    penerimaan." />
            }
          />
        </div>
      </LiquidGlass>
    </>
  );
}
