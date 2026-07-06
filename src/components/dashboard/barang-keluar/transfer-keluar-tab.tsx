"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRightLeftIcon,
  PlusIcon,
  PrinterIcon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react";

import type { DateRange } from "react-day-picker";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DateRangePicker } from "@/components/ui/date-picker";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import {
  useOutboundDrafts,
  useOutboundTransit,
  useOutboundFinished,
  useShipTransfer,
  useSubmitDraft,
  useDeleteTransfer,
} from "@/hooks/barang-keluar/use-outbound-transfers";
import { useMe } from "@/hooks/auth/use-auth";
import { toast } from "sonner";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { useDebouncedSearch } from "@/hooks/shared/use-debounced-search";
import type { InventoryTransfer } from "@/types/barang-masuk/inventory-transfer";
import { formatDate } from "@/lib/format";

type SubTab = "draft" | "transit" | "finished";

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "draft", label: "Baru Dibuat" },
  { key: "transit", label: "Sedang Dijalan" },
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
          <Link
            href={`/dashboard/barang-keluar/transfer/${row.original.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-primary underline-offset-2 transition-colors hover:underline"
          >
            {row.original.transfer_number}
          </Link>
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

  const shipMutation = useShipTransfer();

  const [deleteTarget, setDeleteTarget] = useState<InventoryTransfer | null>(
    null,
  );
  const deleteMutation = useDeleteTransfer();

  const submitMutation = useSubmitDraft();
  const { data: me } = useMe();
  const meName = me?.name ?? "";
  const [printingId, setPrintingId] = useState<string | null>(null);

  // Konsisten dengan komponen lain: preview PDF via halaman document-preview,
  // bukan blob URL. (lihat transfer-out-detail-view, penyesuaian-tab, dst.)
  const openTransferPdf = useCallback((id: string) => {
    window.open(
      `/dashboard/document-preview/transfer-out/${id}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, []);

  const handlePrint = useCallback(
    async (item: InventoryTransfer) => {
      if (printingId) return;
      setPrintingId(item.id);
      try {
        if (item.status === "DRAFT") {
          await submitMutation.mutateAsync(item.id);
          toast.success("Transfer dikirim — pindah ke Sedang Dijalan");
        } else if (item.status === "APPROVED") {
          await shipMutation.mutateAsync({
            id: item.id,
            data: { shipped_by: meName },
          });
        }
        openTransferPdf(item.id);
      } catch (err) {
        toast.error(
          (err as { message?: string })?.message ||
            "Gagal memproses cetak transfer",
        );
      } finally {
        setPrintingId(null);
      }
    },
    [printingId, submitMutation, shipMutation, meName, openTransferPdf],
  );

  const handleReprint = useCallback(
    (item: InventoryTransfer) => {
      openTransferPdf(item.id);
    },
    [openTransferPdf],
  );

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

  const handleRowClick = useCallback(
    (item: InventoryTransfer) => {
      router.push(`/dashboard/barang-keluar/transfer/${item.id}`);
    },
    [router],
  );

  const draftActions = useCallback(
    (item: InventoryTransfer) => (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handlePrint(item)}
          disabled={printingId === item.id}
          title="Cetak Surat Jalan & kirim"
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
        >
          {printingId === item.id ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <PrinterIcon className="size-3.5" />
          )}
          Cetak
        </button>
        <button
          type="button"
          onClick={() => setDeleteTarget(item)}
          title="Hapus transfer"
          className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
        >
          <Trash2Icon className="size-3.5" />
        </button>
      </div>
    ),
    [handlePrint, printingId],
  );

  const reprintActions = useCallback(
    (item: InventoryTransfer) => (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleReprint(item)}
          disabled={printingId === item.id}
          title="Cetak ulang Surat Jalan"
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
        >
          {printingId === item.id ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <PrinterIcon className="size-3.5" />
          )}
        </button>
      </div>
    ),
    [handleReprint, printingId],
  );

  return (
    <>
      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-5">
          <Tabs value={subTab} onValueChange={(val) => handleSubTabChange(val as SubTab)} className="flex flex-col gap-4">
            <TabsList variant="line" className="h-auto">
              {SUB_TABS.map(({ key, label }) => (
                <TabsTrigger key={key} value={key}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button
            size="sm"
            onClick={() =>
              router.push("/dashboard/barang-keluar/transfer/tambah")
            }
          >
            <PlusIcon className="mr-1.5 size-4" />
            Tambah baru
          </Button>
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
          actionSlot={subTab === "draft" ? draftActions : reprintActions}
        />
      </LiquidGlass>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus Transfer"
        description={`Hapus transfer ${deleteTarget?.transfer_number ?? ""}? Stok yang sudah dialokasikan akan dikembalikan. Aksi ini tidak bisa dibatalkan.`}
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
