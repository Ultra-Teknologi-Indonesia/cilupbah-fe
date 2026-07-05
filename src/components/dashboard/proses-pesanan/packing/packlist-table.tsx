"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCwIcon,
  MoreHorizontalIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FulfillmentFilterBar,
  type FulfillmentFilterValue,
} from "@/components/dashboard/proses-pesanan/shared/fulfillment-filter-bar";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  usePacklists,
  usePrefetchPacklistDetail,
} from "@/hooks/proses-pesanan/use-fulfillment";
import { type Packlist } from "@/types/proses-pesanan/fulfillment";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";

import { DeleteOrderDialog } from "../shared/delete-order-dialog";
import { UbahPackerDialog } from "./ubah-packer-dialog";

export function PacklistTable() {
  const router = useRouter();
  const prefetchPacklistDetail = usePrefetchPacklistDetail();
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [editPacker, setEditPacker] = React.useState<Packlist | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Packlist | null>(
    null,
  );
  const [filter, setFilter] = React.useState<FulfillmentFilterValue>({});

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const params = React.useMemo(
    () => ({
      q: debounced || undefined,
      page,
      per_page: 20,
      status: "DRAFT,IN_PROGRESS",
      shipping_provider: filter.shipping_provider,
      label_printed: filter.label_printed as "yes" | "no" | undefined,
      date_from: filter.date_from,
      date_to: filter.date_to,
    }),
    [debounced, page, filter],
  );
  const { data, isLoading, isFetching, refetch } = usePacklists(params);

  const packlists = data?.items ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  };

  const prefetchPacklist = React.useCallback(
    (id: string) => {
      router.prefetch(`/dashboard/proses-pesanan/packing/${id}`);
      prefetchPacklistDetail(id);
    },
    [router, prefetchPacklistDetail],
  );

  const columns = React.useMemo<ColumnDef<Packlist>[]>(
    () => [
      {
        accessorKey: "packlistNo",
        header: "No. Packing",
        cell: ({ row }) => (
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() =>
              router.push(
                `/dashboard/proses-pesanan/packing/${row.original.id}`,
              )
            }
            onMouseEnter={() => prefetchPacklist(row.original.id)}
            onFocus={() => prefetchPacklist(row.original.id)}
          >
            {row.original.packlistNo}
          </button>
        ),
      },
      {
        accessorKey: "orderNo",
        header: "No. Pesanan",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                row.original.isInstant &&
                  "font-semibold text-orange-700 dark:text-orange-400",
              )}
            >
              {row.original.orderNo ?? "—"}
            </span>
            {row.original.isInstant && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-0.5 rounded border border-orange-500/60 bg-orange-500/15 px-1 py-0.5 text-[9px] font-semibold text-orange-700 dark:text-orange-400">
                      <ZapIcon className="size-2.5 fill-current" />
                      INSTANT
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Pesanan instan — prioritaskan!</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Pelanggan",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.customerName ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "locationName",
        header: "Lokasi",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.locationName ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "packerName",
        header: "Packer",
        cell: ({ row }) => <span>{row.original.packerName ?? "—"}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge domain="packlist" status={row.original.status} />
        ),
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Aksi">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem
                  onSelect={() =>
                    router.push(
                      `/dashboard/proses-pesanan/packing/${row.original.id}`,
                    )
                  }
                  onMouseEnter={() => prefetchPacklist(row.original.id)}
                >
                  Proses Packing
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setEditPacker(row.original)}>
                  Ubah Packer
                </DropdownMenuItem>
                {row.original.orderId && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDeleteTarget(row.original)}
                    >
                      <Trash2Icon className="size-4 mr-2" />
                      Hapus Pesanan
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [router, prefetchPacklist],
  );

  return (
    <div>
      <FulfillmentFilterBar
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setPage(1);
        }}
        fields={["courier", "date", "label_printed"]}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Cari no. packing…"
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
          data={packlists}
          isLoading={isLoading}
          hideToolbar
          getRowClassName={(row) =>
            row.isInstant
              ? "bg-orange-50/60 dark:bg-orange-950/20 border-l-4 border-l-orange-500"
              : undefined
          }
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
              Tidak ada packlist.
            </div>
          }
        />
      </div>

      <UbahPackerDialog
        open={!!editPacker}
        onOpenChange={(o) => !o && setEditPacker(null)}
        packlistId={editPacker?.id ?? null}
        packlistNo={editPacker?.packlistNo ?? null}
        locationId={editPacker?.locationId ?? null}
        currentPackerId={editPacker?.packerId ?? null}
      />

      <DeleteOrderDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        orderId={deleteTarget?.orderId ?? null}
        orderNo={deleteTarget?.orderNo ?? null}
      />
    </div>
  );
}
