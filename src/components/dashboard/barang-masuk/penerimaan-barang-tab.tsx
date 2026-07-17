"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  LockIcon,
  PackageCheckIcon,
  DownloadIcon,
  LayersIcon,
  PlayIcon,
  PlusIcon,
  PrinterIcon,
  Trash2Icon,
  } from "lucide-react";
import { toast } from "sonner";
import { BuatPenempatanManualDialog } from "./buat-penempatan-manual-dialog";
import { TerimaTransferDialog } from "./terima-transfer-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ColumnDef } from "@tanstack/react-table";
import { AssignedBadge } from "@/components/shared/channel-lock";
import { DataTable } from "@/components/ui/data-table/data-table";
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import {
  useInbounds,
  useBulkCancelInbounds,
} from "@/hooks/barang-masuk/use-inbound";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { useListState } from "@/hooks/use-list-state";
import { useUrlTab } from "@/hooks/use-url-tab";
import { exportCsv } from "@/lib/export-csv";
import type { Inbound } from "@/types/barang-masuk/inbound";
import { formatDateTime } from "@/lib/format";

/** Sub-tab sumber → filter[type] pada daftar penerimaan. */
type SourceTab = "semua" | "pesanan" | "transfer" | "retur";
const SOURCE_TABS: readonly SourceTab[] = [
  "semua",
  "pesanan",
  "transfer",
  "retur",
];
const TAB_TO_TYPE: Record<SourceTab, string> = {
  semua: "",
  pesanan: "PURCHASE_ORDER",
  transfer: "TRANSIT_IN",
  retur: "SALES_RETURN",
};

/** Putaway yang masih berjalan (bisa dilanjutkan prosesnya). */
function activePutaway(item: Inbound) {
  return item.putaways?.find(
    (p) => !["COMPLETED", "CANCELLED"].includes(p.status),
  );
}


const TYPE_LABEL: Record<string, string> = {
  PURCHASE_ORDER: "PO",
  TRANSIT_IN: "Transfer",
  SALES_RETURN: "Retur",
  CONSIGNMENT: "Konsinyasi",
};

const TYPE_VARIANT: Record<
  string,
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "muted"
  | "info"
  | "indigo"
  | "purple"
  | "orange"
  | "teal"
> = {
  PURCHASE_ORDER: "info",
  TRANSIT_IN: "purple",
  SALES_RETURN: "orange",
  CONSIGNMENT: "teal",
};

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} className="h-1.5 w-16" />
      <span className="text-xs tabular-nums text-muted-foreground">
        {value} / {total}
      </span>
    </div>
  );
}

/** Penerimaan bisa dibuat penempatan: belum tuntas/batal, masih ada qty pending (received - putaway - reserved). */
function isSelectable(item: Inbound): boolean {
  const totalRecv = item.items?.reduce((s, i) => s + (i.received_qty || 0), 0) ?? 0;
  const totalPutaway =
    item.items?.reduce((s, i) => s + (i.putaway_qty || 0), 0) ?? 0;
  const totalReserved =
    item.items?.reduce((s, i) => s + (i.reserved_qty || 0), 0) ?? 0;
  return (
    !["DRAFT", "COMPLETED", "CANCELLED"].includes(item.status) &&
    totalRecv > 0 &&
    totalPutaway + totalReserved < totalRecv
  );
}

/** Transfer sedang dijalan yang belum diterima → bisa di-Terima dari web. */
function isTransitReceivable(item: Inbound): boolean {
  return (
    item.type === "TRANSIT_IN" &&
    item.status === "DRAFT" &&
    !!item.source_id
  );
}

interface FilterState {
  location_id: string;
}

const EMPTY_FILTERS: FilterState = { location_id: "" };

function handleExportList(items: Inbound[]) {
  const headers = [
    "No. Penerimaan",
    "Sumber",
    "No. Referensi",
    "Tanggal Transfer Keluar",
    "Lokasi",
    "Qty Diterima",
  ];
  const rows = items.map((item) => {
    const totalRecv = item.items?.reduce((s, i) => s + i.received_qty, 0) ?? 0;
    return [
      item.transaction_number,
      TYPE_LABEL[item.type] ?? item.type,
      item.reference_number ?? "",
      item.expected_date ? formatDateTime(item.expected_date) : formatDateTime(item.created_at),
      item.location?.location_name ?? "",
      String(totalRecv),
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

  const list = useListState<FilterState>(EMPTY_FILTERS, {
    perPage: 20,
    debounceMs: 300,
    namespace: "penerimaan",
  });
  const [sourceTab, setSourceTab] = useUrlTab<SourceTab>("tab", "semua", {
    validValues: SOURCE_TABS,
    clearKeys: ["penerimaan_page"],
  });

  const handleTabChange = useCallback(
    (v: SourceTab) => {
      setSourceTab(v);
    },
    [setSourceTab],
  );

  const params = useMemo(
    () => ({
      search: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      "filter[location_id]": list.filters.location_id || undefined,
      "filter[type]": TAB_TO_TYPE[sourceTab] || undefined,
      sort: "-expected_date",
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters, sourceTab],
  );

  const { data, isLoading, isFetching } = useInbounds(params);
  const { data: locData } = useLocations({ perPage: 100 });

  const [penempatanTargets, setPenempatanTargets] = useState<Inbound[]>([]);
  const [terimaTarget, setTerimaTarget] = useState<Inbound | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<Inbound[]>([]);
  const bulkCancel = useBulkCancelInbounds();
  const resetSelectionRef = useRef<(() => void) | null>(null);

  const columns = useMemo<ColumnDef<Inbound>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Pilih semua"
          />
        ),
        cell: ({ row }) => {
          const selectable = isSelectable(row.original);
          if (!selectable) {
            return (
              <div
                className="flex size-4 items-center justify-center text-muted-foreground"
                title="Tidak ada qty pending untuk penempatan baru"
                aria-label="Tidak ada pending"
              >
                <LockIcon className="size-4" />
              </div>
            );
          }
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Pilih baris"
              />
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 36,
      },
      {
        accessorKey: "transaction_number",
        header: "No. Penerimaan",
        cell: ({ row }) => (
          <Link href={`/dashboard/barang-masuk/penerimaan/${row.original.id}`} className="font-medium text-primary underline-offset-2 hover:underline">
            {row.original.transaction_number}
          </Link>
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
          <span>
            {row.original.reference_number ?? "—"}
          </span>
        ),
      },
      {
        id: "tanggal",
        header: "Tanggal Transfer Keluar",
        cell: ({ row }) => (
          <span>
            {row.original.expected_date
              ? formatDateTime(row.original.expected_date)
              : formatDateTime(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "location",
        header: "Lokasi",
        cell: ({ row }) => (
          <span>
            {row.original.location?.location_name ?? "—"}
          </span>
        ),
      },

      {
        id: "progress_penempatan",
        header: "Progress Penempatan",
        cell: ({ row }) => {
          const totalRecv =
            row.original.items?.reduce((s, i) => s + i.received_qty, 0) ?? 0;
          const totalPutaway =
            row.original.items?.reduce((s, i) => s + i.putaway_qty, 0) ?? 0;
          return <ProgressBar value={totalPutaway} total={totalRecv} />;
        },
      },

      {
        id: "dikerjakan",
        header: "Dikerjakan",
        cell: ({ row }) => {
          const worker = row.original.putaways?.[0]?.assignee?.name;
          return <span>{worker ?? "—"}</span>;
        },
      },
      {
        accessorKey: "notes",
        header: "Keterangan",
        cell: ({ row }) => (
          <span className="inline-block max-w-[200px] whitespace-normal break-words">
            {row.original.notes ?? "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => {
          const item = row.original;
          const active = activePutaway(item);
          const canDelete =
            !["DRAFT", "CANCELLED"].includes(item.status) && !active;
          const canPrintPO =
            item.source_type === "purchase_order" && !!item.source_id;

          return (
            <div
              className="flex items-center justify-end gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {canPrintPO && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  asChild
                  aria-label="Pratinjau & cetak PO"
                  title="Pratinjau & cetak Barang Masuk Pembelian"
                >
                  <Link
                    href={`/dashboard/document-preview/purchase-order/${item.source_id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PrinterIcon className="size-4" />
                  </Link>
                </Button>
              )}
              {canDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetSelectionRef.current = null;
                    setDeleteTargets([item]);
                  }}
                  aria-label="Hapus penerimaan"
                  title="Hapus penerimaan"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              )}
              {isTransitReceivable(item) && (
                <Button
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTerimaTarget(item);
                  }}
                >
                  <PackageCheckIcon className="size-4" />
                  Terima
                </Button>
              )}
              {isSelectable(item) && (
                <Button
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetSelectionRef.current = null;
                    setPenempatanTargets([item]);
                  }}
                >
                  <LayersIcon className="size-4" />
                  Penempatan
                </Button>
              )}
              {active && (() => {
                const totalRecv =
                  item.items?.reduce(
                    (s, i) => s + (i.received_qty || 0),
                    0,
                  ) ?? 0;
                const totalPutaway =
                  item.items?.reduce(
                    (s, i) => s + (i.putaway_qty || 0),
                    0,
                  ) ?? 0;
                const isFullyPutaway =
                  totalRecv > 0 && totalPutaway >= totalRecv;
                const Icon = isFullyPutaway ? EyeIcon : PlayIcon;
                const label = isFullyPutaway ? "Lihat" : "Pantau";
                return (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    asChild
                  >
                    <Link
                      href={`/dashboard/barang-masuk/putaway/${active.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  </Button>
                );
              })()}
            </div>
          );
        },
      },
    ],
    [],
  );

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

  const hasActiveFilter = list.hasActiveFilter;
  const activeCount = list.activeFilterCount;

  return (
    <>
      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 sm:px-5">
          <Tabs
            value={sourceTab}
            onValueChange={(v) => handleTabChange(v as SourceTab)}
          >
            <TabsList variant="line" className="h-auto">
              <TabsTrigger value="semua">Semua</TabsTrigger>
              <TabsTrigger value="pesanan">Pesanan Pembelian</TabsTrigger>
              <TabsTrigger value="transfer">Transfer Masuk</TabsTrigger>
              <TabsTrigger value="retur">Retur Penjualan</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportList(items)}
              >
                <DownloadIcon className="mr-1.5 size-4" />
                Export CSV
              </Button>
            )}
            <Button size="sm" asChild>
              <Link href="/dashboard/barang-masuk/penerimaan/tambah">
                <PlusIcon className="mr-1.5 size-4" />
                Tambah Penerimaan
              </Link>
            </Button>
          </div>
        </div>
        <FilterToolbar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Cari no. penerimaan..."
          align="end"
          onReset={hasActiveFilter ? () => list.resetFilters() : undefined}
          hasFilter={hasActiveFilter}
          activeCount={activeCount}
          gridCols={2}
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
            getRowId={(row) => row.id}
            enableRowSelection={(row) => isSelectable(row.original)}
            bulkActions={(selected, table) => {
              const sameLocation =
                new Set(selected.map((s) => s.location_id)).size <= 1;
              return (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() => {
                      if (!sameLocation) {
                        toast.warning(
                          "Penerimaan harus dari lokasi/gudang yang sama untuk digabung.",
                        );
                        return;
                      }
                      resetSelectionRef.current = () =>
                        table.resetRowSelection();
                      setPenempatanTargets(selected);
                    }}
                    title={
                      sameLocation
                        ? undefined
                        : "Pilih penerimaan dari lokasi yang sama"
                    }
                  >
                    <LayersIcon className="size-4" />
                    Buat Penempatan ({selected.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 gap-1.5"
                    onClick={() => {
                      resetSelectionRef.current = () =>
                        table.resetRowSelection();
                      setDeleteTargets(selected);
                    }}
                  >
                    <Trash2Icon className="size-4" />
                    Hapus ({selected.length})
                  </Button>
                </div>
              );
            }}

            pagination={list.pagination}
            rowCount={meta.total}
            onPaginationChange={list.onPaginationChange}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <EmptyState icon={PackageCheckIcon} title="Belum ada penerimaan barang" description="Dokumen penerimaan dari PO, Transfer, atau Retur akan tampil
                    di sini." />
            }
          />
        </div>
      </LiquidGlass>

      <BuatPenempatanManualDialog
        inbounds={penempatanTargets}
        open={penempatanTargets.length > 0}
        onOpenChange={(open) => {
          if (!open) setPenempatanTargets([]);
        }}
        onSuccess={(data) => {
          resetSelectionRef.current?.();
          resetSelectionRef.current = null;
          const putawayId =
            (data as { id?: string })?.id ??
            (Array.isArray(data)
              ? (data[0] as { id?: string })?.id
              : undefined);
          if (putawayId) {
            router.push(`/dashboard/barang-masuk/putaway/${putawayId}`);
          }
        }}
      />

      <TerimaTransferDialog
        key={terimaTarget?.id ?? "none"}
        inbound={terimaTarget}
        open={!!terimaTarget}
        onOpenChange={(open) => {
          if (!open) setTerimaTarget(null);
        }}
      />

      <ConfirmDialog
        open={deleteTargets.length > 0}
        onOpenChange={(open) => {
          if (!open) setDeleteTargets([]);
        }}
        variant="destructive"
        title={`Hapus ${deleteTargets.length} penerimaan?`}
        description={(() => {
          if (deleteTargets.length === 0) return "";
          const isSingle = deleteTargets.length === 1;
          const target = deleteTargets[0];
          const allTransfer = deleteTargets.every(
            (d) => d.source_type === "transfer",
          );
          const allPO = deleteTargets.every(
            (d) => d.source_type === "purchase_order",
          );
          const hasCompleted = deleteTargets.some(
            (d) => d.status === "COMPLETED",
          );

          if (allTransfer && hasCompleted) {
            return isSingle
              ? `Penerimaan ${target.transaction_number} sudah selesai (barang di rak). Menghapus akan membalik penempatan ke rak inbound dan mengembalikan Transfer Keluar terkait ke Sedang Dijalan. Barang bisa diterima ulang.`
              : "Sebagian penerimaan sudah selesai. Menghapus akan membalik penempatan ke rak inbound dan mengembalikan Transfer Keluar terkait ke Sedang Dijalan.";
          }

          if (allTransfer) {
            return isSingle
              ? `Penerimaan ${target.transaction_number} akan dihapus dan Transfer Keluar terkait dikembalikan ke Sedang Dijalan. Barang bisa diterima ulang.`
              : "Penerimaan transfer dihapus dan Transfer Keluar terkait dikembalikan ke Sedang Dijalan. Barang bisa diterima ulang.";
          }

          if (allPO && hasCompleted) {
            return isSingle
              ? `Penerimaan ${target.transaction_number} sudah selesai (barang di rak). Menghapus akan membalik penempatan dan mengembalikan Pesanan Pembelian ke status Belum Diterima agar bisa diterima ulang.`
              : "Sebagian penerimaan PO sudah selesai. Menghapus akan membalik penempatan dan mengembalikan Pesanan Pembelian ke Belum Diterima.";
          }

          return "Penerimaan dibatalkan dan stok yang belum ditempatkan dikembalikan dari bin inbound. Tindakan ini tidak bisa dibatalkan.";
        })()}
        confirmLabel="Hapus"
        loading={bulkCancel.isPending}
        onConfirm={() => {
          bulkCancel.mutate(
            deleteTargets.map((d) => d.id),
            {
              onSuccess: () => {
                resetSelectionRef.current?.();
                resetSelectionRef.current = null;
                setDeleteTargets([]);
              },
            },
          );
        }}
      />
    </>
  );
}
