"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { CornerDownLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlagIcon,
  PlusIcon, Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
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
} from "@/hooks/barang-masuk/use-sales-return-actions";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import type { SalesReturn } from "@/types/barang-masuk/sales-return";
import { formatDate } from "@/lib/format";

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

interface FilterState {
  location_id: string;
}

const EMPTY_FILTERS: FilterState = { location_id: "" };

export function ReturChannelTab() {
  const [subTab, setSubTab] = useState<ReturSubTab>("unprocessed");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const [acceptTarget, setAcceptTarget] = useState<SalesReturn | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SalesReturn | null>(null);
  const [completeTarget, setCompleteTarget] = useState<SalesReturn | null>(
    null,
  );
  const [processedBy, setProcessedBy] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const acceptMutation = useAcceptSalesReturn();
  const rejectMutation = useRejectSalesReturn();
  const completeMutation = useCompleteSalesReturn();

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

  const handleSubTabChange = useCallback((t: ReturSubTab) => {
    setSubTab(t);
    setPage(1);
  }, []);

  const isUnprocessed = subTab === "unprocessed";
  const statusFilter = SUBTAB_TO_STATUS[subTab];

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      page,
      per_page: perPage,
      "filter[status]": statusFilter || undefined,
      "filter[location_id]": filters.location_id || undefined,
    }),
    [debouncedSearch, page, perPage, statusFilter, filters],
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
        header: "No. Retur",
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
        header: "Tgl. Retur",
        cell: ({ row }) => (
          <span className="text-foreground">
            {formatDate(row.original.created_at)}
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
        header: "Aksi",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1.5">
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
        header: "Aksi",
        cell: ({ row }) => {
          const item = row.original;
          return (
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
          );
        },
      });
    }

    return cols;
  }, [isUnprocessed, subTab]);

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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={subTab} onValueChange={(val) => setSubTab(val as any)} className="flex flex-col gap-4">
          <TabsList variant="line" className="h-auto">
            {SUB_TABS.map(({ key, label }) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button size="sm" asChild className="gap-1.5">
          <Link href="/dashboard/barang-masuk/retur/buat">
            <PlusIcon className="size-4" />
            Buat Retur
          </Link>
        </Button>
      </div>

      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. retur, pelanggan..."
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
              <EmptyState icon={CornerDownLeftIcon} title="Belum ada retur" description="Retur dari channel online akan tampil di sini." />
            }
          />
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!acceptTarget}
        onOpenChange={(open) => {
          if (!open) setAcceptTarget(null);
        }}
        title="Setujui Retur"
        description={`Setujui retur ${acceptTarget?.return_number ?? ""}?`}
        confirmLabel="Setujui"
        loading={acceptMutation.isPending}
        onConfirm={() => {
          if (!acceptTarget || !processedBy.trim()) return;
          acceptMutation.mutate(
            { id: acceptTarget.id, processed_by: processedBy.trim() },
            { onSuccess: () => setAcceptTarget(null) },
          );
        }}
      >
        <div className="px-1 py-2">
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
