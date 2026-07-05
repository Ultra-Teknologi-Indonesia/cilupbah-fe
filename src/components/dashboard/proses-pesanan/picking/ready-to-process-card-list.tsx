"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, PackageOpenIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { Button } from "@/components/ui/button";
import {
  SimplePagination,
  GRID_PAGE_SIZES,
} from "@/components/ui/simple-pagination";
import { OrderTable } from "@/components/dashboard/proses-pesanan/shared/order-table";
import { BulkBuatPicklistConfirmDialog } from "@/components/dashboard/proses-pesanan/picking/bulk-buat-picklist-confirm-dialog";
import {
  FulfillmentFilterBar,
  type FulfillmentFilterValue,
} from "@/components/dashboard/proses-pesanan/shared/fulfillment-filter-bar";
import { UserSelectById } from "@/components/dashboard/shared/user-select-by-id";
import { useMe } from "@/hooks/auth/use-auth";
import {
  fulfillmentKeys,
  useCreatePicklist,
  useOrdersByStage,
  usePickers,
} from "@/hooks/proses-pesanan/use-fulfillment";
import { orderKeys } from "@/hooks/pesanan/use-orders";
import { fulfillmentToOrder } from "@/lib/proses-pesanan/order-card-mapper";
import { cn } from "@/lib/utils";

export function ReadyToProcessCardList() {
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [pickerId, setPickerId] = React.useState<string>("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<FulfillmentFilterValue>({});

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const params = React.useMemo(
    () => ({
      q: debounced || undefined,
      shipping_provider: filter.shipping_provider,
      location_id: filter.location_id,
      source: filter.source,
      channel_shop_id: filter.channel_shop_id,
      label_printed: filter.label_printed as "yes" | "no" | undefined,
      date_from: filter.date_from,
      date_to: filter.date_to,
      exclude_transit: "1" as const,
      page,
      per_page: perPage,
    }),
    [debounced, filter, page, perPage],
  );

  const { data, isLoading, isFetching, refetch } = useOrdersByStage(
    "ready-to-process",
    params,
  );
  const orders = React.useMemo(() => data?.items ?? [], [data]);
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  };

  const mappedOrders = React.useMemo(
    () => orders.map((o) => ({ raw: o, ui: fulfillmentToOrder(o) })),
    [orders],
  );

  const pageIds = orders.map((o) => o.id);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected = pageIds.some((id) => selected.has(id));

  const selectedOrders = orders.filter((o) => selected.has(o.id));
  const distinctLocations = Array.from(
    new Set(selectedOrders.map((o) => o.locationId).filter(Boolean)),
  ) as string[];
  const locationId = distinctLocations[0] ?? null;
  const multiLocation = distinctLocations.length > 1;
  const locationName = selectedOrders[0]?.locationName ?? null;

  const pickers = usePickers(locationId ?? undefined, undefined, !!locationId);
  const createPicklist = useCreatePicklist();
  const { data: me } = useMe();
  const pickerOptions = React.useMemo(
    () =>
      (pickers.data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
      })),
    [pickers.data],
  );
  const selectedPicker = pickers.data?.find((p) => p.id === pickerId) ?? null;

  const prevLocationRef = React.useRef<string | null>(locationId);
  if (prevLocationRef.current !== locationId) {
    prevLocationRef.current = locationId;
    if (pickerId !== "") setPickerId("");
  }

  const clearSelection = () => {
    setSelected(new Set());
    setPickerId("");
  };

  const toggleAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      setSelected(new Set(pageIds));
    }
  };

  const toggleOne = (id: string, v: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (v) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleCreatePicklist = async () => {
    if (!locationId) {
      toast.error("Lokasi pesanan tidak ditemukan");
      return;
    }
    if (multiLocation) {
      toast.error("Pesanan terpilih berasal dari lokasi berbeda");
      return;
    }
    if (!pickerId) {
      toast.error("Pilih picker terlebih dahulu");
      return;
    }
    try {
      const res = await createPicklist.mutateAsync({
        order_ids: Array.from(selected),
        location_id: locationId,
        picker_id: pickerId,
      });
      const no = res?.picklistNo ?? "";
      toast.success(
        no ? `Picklist ${no} berhasil dibuat` : "Picklist berhasil dibuat",
      );
      clearSelection();
      setConfirmOpen(false);
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
      qc.invalidateQueries({ queryKey: orderKeys.all });
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal membuat picklist";
      toast.error(msg);
    }
  };

  return (
    <div>
      {}
      <FulfillmentFilterBar
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setPage(1);
        }}
        fields={[
          "courier",
          "location",
          "channel",
          "store",
          "label_printed",
          "date",
        ]}
        excludeTransit
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Cari no. pesanan…"
      />

      <div className="flex flex-wrap items-center gap-4 border-b border-border/40 px-4 py-2 sm:px-5">
        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
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
      </div>

      {}
      <div className="px-4 pb-4 sm:px-5">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-xl border border-border/60 bg-muted/30"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted/60">
              <PackageOpenIcon className="size-8 text-muted-foreground/70" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Belum ada pesanan siap dipick
              </p>
              <p className="text-xs text-muted-foreground">
                Pesanan akan muncul di sini setelah klik &quot;Proses
                Pesanan&quot; di halaman Pesanan.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/pesanan">Buka Halaman Pesanan</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            <BulkActionBar
              count={selected.size}
              onClear={clearSelection}
              label={(n) => `${n} pesanan dipilih`}
              message={
                multiLocation ? (
                  <span className="text-xs text-destructive">
                    Pesanan dari lokasi berbeda — pilih dari satu lokasi saja
                  </span>
                ) : null
              }
              actions={
                multiLocation ? null : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Picker
                      </span>
                      <UserSelectById
                        value={pickerId}
                        onChange={(id) => setPickerId(id)}
                        options={pickerOptions}
                        isLoading={pickers.isLoading}
                        currentUserId={me?.id}
                        disabled={!locationId || pickers.isLoading}
                        placeholder={
                          pickers.isLoading ? "Memuat…" : "Pilih picker…"
                        }
                        emptyText="Tidak ada picker di lokasi ini."
                        className="w-72"
                      />
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setConfirmOpen(true)}
                      disabled={createPicklist.isPending || !pickerId}
                    >
                      {createPicklist.isPending && (
                        <Loader2Icon className="animate-spin" />
                      )}
                      Buat Picklist
                    </Button>
                  </>
                )
              }
            />

            <OrderTable
              orders={mappedOrders.map((m) => m.ui)}
              tab="all"
              variant="outbound-ready"
              selectable
              selectedIds={selected}
              onToggle={toggleOne}
              allSelected={allSelected}
              someSelected={someSelected}
              onToggleAll={toggleAll}
            />
          </div>
        )}
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <SimplePagination
          page={meta.current_page}
          lastPage={meta.last_page}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(s) => {
            setPerPage(s);
            setPage(1);
          }}
          pageSizeOptions={GRID_PAGE_SIZES}
          isFetching={isFetching}
          label="pesanan"
          total={meta.total}
        />
      </div>

      <BulkBuatPicklistConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedOrders={selectedOrders}
        pickerName={selectedPicker?.name ?? null}
        pickerEmail={selectedPicker?.email ?? null}
        locationName={locationName}
        loading={createPicklist.isPending}
        onConfirm={handleCreatePicklist}
      />
    </div>
  );
}
