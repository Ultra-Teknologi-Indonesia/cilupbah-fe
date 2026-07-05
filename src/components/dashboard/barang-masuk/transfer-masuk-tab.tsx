"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeftIcon, PackageCheckIcon, Loader2Icon } from "lucide-react";

import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { DateRangePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { useIncomingTransfers } from "@/hooks/barang-masuk/use-inventory-transfers";
import { useReceiveTransfer } from "@/hooks/barang-masuk/use-receive-transfer";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { useDebouncedSearch } from "@/hooks/shared/use-debounced-search";
import type { InventoryTransfer } from "@/types/barang-masuk/inventory-transfer";
import { formatDate } from "@/lib/format";

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "IN_TRANSIT", label: "Dalam Perjalanan" },
  { value: "RECEIVED", label: "Diterima" },
];

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

export function TransferMasukTab() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const [receiveTarget, setReceiveTarget] = useState<InventoryTransfer | null>(
    null,
  );
  const [receivedBy, setReceivedBy] = useState("");
  const receiveMutation = useReceiveTransfer();

  const resetPage = useCallback(() => setPage(1), []);
  const debouncedSearch = useDebouncedSearch(search, resetPage);

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
      "filter[destination_location_id]": filters.location_id || undefined,
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

  const { data, isLoading, isFetching } = useIncomingTransfers(params);
  const { data: locData } = useLocations({ perPage: 100 });

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
          <span>{row.original.source_location?.location_name ?? "—"}</span>
        ),
      },
      {
        id: "destination_location",
        header: "Lokasi Tujuan",
        cell: ({ row }) => (
          <span>{row.original.destination_location?.location_name ?? "—"}</span>
        ),
      },
      {
        accessorKey: "created_by",
        header: "Dibuat Oleh",
        cell: ({ row }) => <span>{row.original.created_by}</span>,
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
          />
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
          const item = row.original;
          if (item.status === "IN_TRANSIT") {
            return (
              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => {
                    setReceiveTarget(item);
                    setReceivedBy("");
                  }}
                >
                  <PackageCheckIcon className="h-4 w-4" />
                  Terima
                </Button>
              </div>
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
          gridCols={3}
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
            placeholder="Lokasi Tujuan"
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
            onRowClick={(item) =>
              router.push(`/dashboard/barang-masuk/transfer/${item.id}`)
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
              <EmptyState icon={ArrowRightLeftIcon} title="Belum ada transfer masuk" description="Transfer barang antar lokasi yang masuk akan tampil di sini." />
            }
          />
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!receiveTarget}
        onOpenChange={(open) => {
          if (!open) setReceiveTarget(null);
        }}
        title="Terima Transfer"
        description={`Terima transfer ${receiveTarget?.transfer_number ?? ""}?`}
        confirmLabel="Terima"
        loading={receiveMutation.isPending}
        onConfirm={() => {
          if (!receiveTarget || !receivedBy.trim()) return;
          receiveMutation.mutate(
            { id: receiveTarget.id, data: { received_by: receivedBy.trim() } },
            { onSuccess: () => setReceiveTarget(null) },
          );
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="transfer-received-by" className="text-sm font-medium">
            Diterima oleh <span className="text-destructive">*</span>
          </Label>
          <UserSelect
            value={receivedBy}
            onChange={setReceivedBy}
            defaultToSelf
            placeholder="Nama penerima"
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>
    </>
  );
}
