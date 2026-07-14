"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2Icon,
  Loader2Icon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDateTime } from "@/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  FulfillmentFilterBar,
  type FulfillmentFilterValue,
} from "@/components/dashboard/proses-pesanan/shared/fulfillment-filter-bar";
import {
  useCompletedShipments,
  useMarkDelivered,
  useReconcileShipment,
} from "@/hooks/proses-pesanan/use-fulfillment";
import type {
  Shipment,
  ReconcileSummary,
  ShipmentStatus,
} from "@/types/proses-pesanan/fulfillment";
import { SHIPMENT_STATUS_LABEL } from "@/types/proses-pesanan/fulfillment";
import { ShipmentDriverBadge } from "@/components/dashboard/proses-pesanan/shared/driver-call-indicator";
import { useListState } from "@/hooks/use-list-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_OPTIONS = [
  { value: "HANDED_OVER", label: "Diserahkan" },
  { value: "IN_TRANSIT", label: "Dikirim" },
  { value: "DELIVERED", label: "Terkirim" },
];

type PageFilterState = {
  status: string;
  courier_code: string;
  date_from: string;
  date_to: string;
};

const EMPTY_FILTERS: PageFilterState = {
  status: "",
  courier_code: "",
  date_from: "",
  date_to: "",
};

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const cfg = SHIPMENT_STATUS_LABEL[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge
      variant="secondary"
      className={cn("text-2xs px-1.5 py-0", cfg.className)}
    >
      {cfg.label}
    </Badge>
  );
}

function ReconcileDialog({
  open,
  onOpenChange,
  summary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: ReconcileSummary | null;
}) {
  if (!summary) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Hasil Rekonsiliasi</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 text-center text-sm mb-4">
          <div className="rounded-lg bg-emerald-500/10 px-3 py-2">
            <p className="text-2xl font-bold text-emerald-600">
              {summary.delivered}
            </p>
            <p className="text-xs text-muted-foreground">Terkirim</p>
          </div>
          <div className="rounded-lg bg-blue-500/10 px-3 py-2">
            <p className="text-2xl font-bold text-blue-600">
              {summary.in_transit}
            </p>
            <p className="text-xs text-muted-foreground">Dalam Perjalanan</p>
          </div>
          <div className="rounded-lg bg-amber-500/10 px-3 py-2">
            <p className="text-2xl font-bold text-amber-600">
              {summary.anomaly}
            </p>
            <p className="text-xs text-muted-foreground">Anomali</p>
          </div>
        </div>
        {summary.auto_marked_delivered && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 mb-3">
            Semua pesanan terkirim — pengiriman otomatis ditandai DELIVERED.
          </p>
        )}
        <div className="max-h-60 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Pesanan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Kategori</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.details.map((d) => (
                <TableRow key={d.order_id}>
                  <TableCell className="text-xs font-medium">
                    {d.salesorder_no}
                  </TableCell>
                  <TableCell className="text-xs">{d.status}</TableCell>
                  <TableCell className="text-xs">
                    {d.channel_status ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-2xs px-1.5 py-0",
                        d.category === "delivered" &&
                          "bg-emerald-500/10 text-emerald-600",
                        d.category === "in_transit" &&
                          "bg-blue-500/10 text-blue-600",
                        d.category === "anomaly" &&
                          "bg-amber-500/10 text-amber-600",
                      )}
                    >
                      {d.category === "delivered"
                        ? "Terkirim"
                        : d.category === "in_transit"
                          ? "Perjalanan"
                          : "Anomali"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CompletedShipmentTable() {
  const list = useListState<PageFilterState>(EMPTY_FILTERS, {
    perPage: 20,
    debounceMs: 350,
    namespace: "shipment_done",
  });
  const [markTarget, setMarkTarget] = React.useState<Shipment | null>(null);
  const [reconcileSummary, setReconcileSummary] =
    React.useState<ReconcileSummary | null>(null);

  const params = React.useMemo(
    () => ({
      status: list.filters.status || undefined,
      q: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      courier_code: list.filters.courier_code || undefined,
      date_from: list.filters.date_from || undefined,
      date_to: list.filters.date_to || undefined,
      type: "all",
      sort_by: list.sorting[0]?.id || undefined,
      sort_dir: list.sorting[0] ? (list.sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters, list.sorting],
  );
  const { data, isLoading, isFetching, refetch } =
    useCompletedShipments(params);
  const markDelivered = useMarkDelivered();
  const reconcile = useReconcileShipment();

  const shipments = data?.items ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  };

  const handleMarkDelivered = () => {
    if (!markTarget) return;
    markDelivered.mutate(markTarget.id, {
      onSuccess: () => {
        toast.success(`${markTarget.shipmentNo} ditandai terkirim.`);
        setMarkTarget(null);
      },
      onError: (e) => {
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: unknown }).message)
            : "Gagal menandai terkirim.";
        toast.error(msg);
      },
    });
  };

  const handleReconcile = (shipment: Shipment) => {
    reconcile.mutate(shipment.id, {
      onSuccess: (summary) => {
        setReconcileSummary(summary);
        if (summary.auto_marked_delivered) {
          toast.success(
            `${shipment.shipmentNo}: semua pesanan terkirim, status diperbarui.`,
          );
        }
      },
      onError: (e) => {
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: unknown }).message)
            : "Gagal merekonsiliasi.";
        toast.error(msg);
      },
    });
  };

  const columns = React.useMemo<ColumnDef<Shipment>[]>(
    () => [
      {
        id: "shipment_no",
        accessorFn: (row) => row.shipmentNo,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="No. Pengiriman" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/proses-pesanan/shipping/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.shipmentNo}
          </Link>
        ),
      },
      {
        id: "courier_code",
        accessorFn: (row) => row.courierName,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Kurir" />
        ),
        cell: ({ row }) => <span>{row.original.courierName ?? "—"}</span>,
      },
      {
        id: "orders_count",
        accessorFn: (row) => row.ordersCount,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Pesanan" />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.ordersCount}</span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "driver",
        header: "Driver",
        cell: ({ row }) => (
          <ShipmentDriverBadge
            status={row.original.driverCallStatus}
            driverName={row.original.driverName}
            driverPhone={row.original.driverPhone}
            calledAt={row.original.driverCalledAt}
          />
        ),
      },
      {
        id: "handed_over_at",
        accessorFn: (row) => row.handedOverAt,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Diserahkan" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-foreground">
            {formatDateTime(row.original.handedOverAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
          const s = row.original;
          if (s.status === "DELIVERED") return null;
          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReconcile(s)}
                disabled={reconcile.isPending}
              >
                {reconcile.isPending ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <SearchIcon className="size-3.5" />
                )}
                Rekonsiliasi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMarkTarget(s)}
              >
                <CheckCircle2Icon className="size-3.5" />
                Tandai Terkirim
              </Button>
            </div>
          );
        },
      },
    ],
    [reconcile.isPending],
  );

  return (
    <div>
      <FulfillmentFilterBar
        value={list.filters as FulfillmentFilterValue}
        onChange={(v) =>
          list.setFilters({ ...EMPTY_FILTERS, ...v } as PageFilterState)
        }
        fields={["courier", "status", "date"]}
        courierMode="courier_code"
        statusOptions={STATUS_OPTIONS}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Cari no. pengiriman…"
      />
      <div className="flex items-center justify-end gap-3 border-b border-border/40 px-4 py-2 text-sm text-muted-foreground sm:px-5">
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full p-1.5 transition-colors hover:bg-muted"
          aria-label="Muat ulang"
        >
          <RefreshCwIcon
            className={cn("size-4", isFetching && "animate-spin")}
          />
        </button>
        <span className="flex items-center gap-1.5">
          Total <Badge>{meta.total}</Badge>
        </span>
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <DataTable
          columns={columns}
          data={shipments}
          isLoading={isLoading}
          hideToolbar
          manualPagination
          manualSorting
          sorting={list.sorting}
          onSortingChange={list.setSorting}
          pagination={list.pagination}
          rowCount={meta.total}
          onPaginationChange={list.onPaginationChange}
          tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
          emptyState={
            <div className="py-16 text-center text-sm text-muted-foreground">
              Belum ada pengiriman yang sudah dikirim.
            </div>
          }
        />
      </div>

      <ConfirmDialog
        open={!!markTarget}
        onOpenChange={(o) => {
          if (!o) setMarkTarget(null);
        }}
        title="Tandai Terkirim"
        description={`Tandai pengiriman ${markTarget?.shipmentNo ?? ""} sebagai terkirim secara manual?`}
        confirmLabel="Tandai Terkirim"
        loading={markDelivered.isPending}
        onConfirm={handleMarkDelivered}
      />

      <ReconcileDialog
        open={!!reconcileSummary}
        onOpenChange={(o) => {
          if (!o) setReconcileSummary(null);
        }}
        summary={reconcileSummary}
      />
    </div>
  );
}
