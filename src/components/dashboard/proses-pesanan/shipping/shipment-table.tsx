"use client";

import * as React from "react";
import Link from "next/link";
import {
  RefreshCwIcon,
  PrinterIcon,
  XCircleIcon,
  ZapIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDateTime } from "@/lib/format";
import {
  FulfillmentFilterBar,
  type FulfillmentFilterValue,
} from "@/components/dashboard/proses-pesanan/shared/fulfillment-filter-bar";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import {
  useCancelShipment,
  useShipments,
} from "@/hooks/proses-pesanan/use-fulfillment";
import type { Shipment } from "@/types/proses-pesanan/fulfillment";
import { ShipmentDriverBadge } from "@/components/dashboard/proses-pesanan/shared/driver-call-indicator";

import { DocActions } from "../picking/doc-actions";

function formatWeight(gram: number): string {
  if (!gram) return "—";
  const kg = gram / 1000;
  return kg < 1
    ? `${gram} g`
    : `${kg.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
}

function instantSlaClass(row: Shipment): string | undefined {
  if (!row.hasInstant || !row.createdAt) return undefined;
  const ageMs = Date.now() - new Date(row.createdAt).getTime();
  const ageH = ageMs / 3_600_000;
  if (ageH > 1.5)
    return "bg-red-50/60 dark:bg-red-950/20 border-l-4 border-l-red-500";
  if (ageH > 1)
    return "bg-yellow-50/60 dark:bg-yellow-950/20 border-l-4 border-l-yellow-500";
  return "bg-emerald-50/60 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500";
}

const SHIPMENT_STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Menunggu" },
  { value: "HANDED_OVER,IN_TRANSIT,DELIVERED", label: "Terkirim" },
];

export function ShipmentTable() {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<FulfillmentFilterValue>({});
  const [cancelTarget, setCancelTarget] = React.useState<Shipment | null>(
    null,
  );

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const params = React.useMemo(
    () => ({
      status: filter.status || "SCHEDULED",
      q: debounced || undefined,
      page,
      per_page: 20,
      courier_code: filter.courier_code,
      shipment_type: filter.shipment_type,
      date_from: filter.date_from,
      date_to: filter.date_to,
    }),
    [debounced, page, filter],
  );
  const { data, isLoading, isFetching, refetch } = useShipments(params);
  const cancel = useCancelShipment();

  const shipments = data?.items ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  };

  const errMsg = (err: unknown, fallback: string) =>
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message)
      : fallback;

  const onCancel = (s: Shipment) => {
    setCancelTarget(s);
  };

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    cancel.mutate(cancelTarget.id, {
      onSuccess: () => toast.success(`${cancelTarget.shipmentNo} dibatalkan.`),
      onError: (e) => toast.error(errMsg(e, "Gagal membatalkan pengiriman.")),
      onSettled: () => setCancelTarget(null),
    });
  };

  const columns = React.useMemo<ColumnDef<Shipment>[]>(
    () => [
      {
        accessorKey: "shipmentNo",
        header: "No. Pengiriman",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Link
              href={`/dashboard/proses-pesanan/shipping/${row.original.id}`}
              className={cn(
                "font-medium hover:underline",
                row.original.hasInstant
                  ? "text-orange-700 dark:text-orange-400"
                  : "text-primary",
              )}
            >
              {row.original.shipmentNo}
            </Link>
            {row.original.hasInstant && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-0.5 rounded-xl border border-orange-500/60 bg-orange-500/15 px-1 py-0.5 text-[9px] font-semibold text-orange-700 dark:text-orange-400">
                      <ZapIcon className="size-2.5 fill-current" />
                      INSTANT
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Manifest ini berisi pesanan instan — prioritaskan!
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ),
      },
      {
        accessorKey: "courierName",
        header: "Kurir",
        cell: ({ row }) => <span>{row.original.courierName ?? "—"}</span>,
      },
      {
        accessorKey: "shipmentType",
        header: "Tipe",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.shipmentType ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "ordersCount",
        header: "Jml. Pesanan",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.ordersCount}</span>
        ),
      },
      {
        accessorKey: "totalWeightGram",
        header: "Total Berat",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatWeight(row.original.totalWeightGram)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Dibuat",
        cell: ({ row }) => (
          <span className="text-foreground text-xs">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
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
        id: "actions",
        header: () => null,
        cell: ({ row }) => (
          <div className="flex justify-end items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => DocActions.manifest(row.original.id)}
            >
              <PrinterIcon className="size-3.5" />
              Cetak Manifest
            </Button>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Batalkan"
                    onClick={() => onCancel(row.original)}
                  >
                    <XCircleIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Batalkan</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <FulfillmentFilterBar
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setPage(1);
        }}
        fields={["courier", "shipment_type", "status", "date"]}
        courierMode="courier_code"
        statusOptions={SHIPMENT_STATUS_OPTIONS}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
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
          getRowClassName={(row) => instantSlaClass(row)}
          manualPagination
          pagination={{
            pageIndex: meta.current_page - 1,
            pageSize: meta.per_page,
          }}
          rowCount={meta.total}
          onPaginationChange={(p) => {
            setPage(p.pageIndex + 1);
          }}
          tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
          emptyState={
            <div className="py-16 text-center text-sm text-muted-foreground">
              Tidak ada jadwal pengiriman.
            </div>
          }
        />
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => {
          if (!o) setCancelTarget(null);
        }}
        title="Batalkan Pengiriman"
        description={`Batalkan pengiriman ${cancelTarget?.shipmentNo ?? ""}?`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancel.isPending}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
