"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ImportIcon, Loader2Icon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";

import { Checkbox } from "@/components/ui/checkbox";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { useOrders } from "@/hooks/pesanan/use-orders";
import { useListState } from "@/hooks/use-list-state";
import { useUrlTab } from "@/hooks/use-url-tab";
import type {
  OrderTab,
  OrderListParams,
  SubFilter,
} from "@/types/pesanan/order";
import {
  SUB_PILL_CONFIG,
  TABS_WITH_ACTIONS,
  TAB_CONFIG,
} from "@/types/pesanan/order";

import { scrollDashboardToTop } from "@/components/ui/simple-pagination";
import { OrderStatusTabs, OrderSubStatusPills } from "./order-status-tabs";
import { OrderFilters, EMPTY_FILTERS, type FilterState } from "./order-filters";
import { OrderCardList } from "./order-card-list";
import { BulkActionBar } from "./bulk-action-bar";
import { ExportCancelDialog } from "./export-cancel-dialog";
import { ExportOrdersDialog } from "./export-orders-dialog";

const TAB_KEYS = TAB_CONFIG.map((t) => t.key as OrderTab);

export function PesananView() {
  const [tab, setTabUrl] = useUrlTab<OrderTab>("tab", "all", {
    validValues: TAB_KEYS,
    clearKeys: ["page", "sub"],
  });
  const subKeys = useMemo(
    () => (SUB_PILL_CONFIG[tab] ?? []).map((p) => p.key),
    [tab],
  );
  const [subValue, setSubUrl] = useUrlTab("sub", "", { 
    validValues: subKeys,
    clearKeys: ["page"],
  });
  const subFilter: SubFilter = (subValue || null) as SubFilter;

  const listSearch = useListState<{ _: string }>(
    { _: "" },
    { perPage: 12, debounceMs: 350 },
  );
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleTabChange = useCallback(
    (t: OrderTab) => {
      setTabUrl(t);
      clearSelection();
      scrollDashboardToTop();
    },
    [setTabUrl, clearSelection],
  );

  const handleSubFilterChange = useCallback(
    (s: SubFilter) => {
      setSubUrl(s ?? "");
      clearSelection();
      scrollDashboardToTop();
    },
    [setSubUrl, clearSelection],
  );

  const handleFilterChange = useCallback(
    (f: FilterState) => {
      setFilters(f);
      listSearch.resetPage();
      scrollDashboardToTop();
    },
    [listSearch],
  );

  const params = useMemo<OrderListParams>(
    () => ({
      tab,
      sub: subFilter || undefined,
      q: listSearch.debouncedSearch || undefined,
      channel: filters.channel || undefined,
      store_id: filters.store_id || undefined,
      location_id: filters.location_id || undefined,
      content_type:
        (filters.content_type as OrderListParams["content_type"]) || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      shipping_provider:
        filters.shipping_provider.length > 0
          ? filters.shipping_provider
          : undefined,
      payment: (filters.payment as OrderListParams["payment"]) || undefined,
      label_printed:
        (filters.label_printed as OrderListParams["label_printed"]) ||
        undefined,
      contact_status:
        (filters.contact_status as OrderListParams["contact_status"]) ||
        undefined,
      decision:
        (filters.decision as OrderListParams["decision"]) || undefined,
      status: filters.status.length > 0 ? filters.status : undefined,
      shadow: (filters.shadow as OrderListParams["shadow"]) || undefined,
      page: listSearch.page,
      per_page: listSearch.perPage,
    }),
    [tab, subFilter, listSearch.debouncedSearch, listSearch.page, listSearch.perPage, filters],
  );

  const { data, isLoading, isFetching, refetch } = useOrders(params);

  const orders = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: listSearch.perPage,
    total: 0,
  };

  const selectable = TABS_WITH_ACTIONS.has(tab);
  const allSelected =
    selectable &&
    orders.length > 0 &&
    orders.every((o) => selectedIds.has(o.id));
  const someSelected = selectable && orders.some((o) => selectedIds.has(o.id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  }, [allSelected, orders]);

  const selectAllCheckbox = selectable ? (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={allSelected ? true : someSelected ? "indeterminate" : false}
        onCheckedChange={toggleAll}
      />
      <span className="text-sm text-muted-foreground">
        {allSelected ? "Batalkan" : "Pilih semua"}
      </span>
    </div>
  ) : null;

  const tabLabel = TAB_CONFIG.find((t) => t.key === tab)?.label ?? "";
  const hasSubPills = !!SUB_PILL_CONFIG[tab];

  return (
    <div className="flex flex-col gap-4">
      <OrderStatusTabs
        active={tab}
        onChange={handleTabChange}
        isFetching={isFetching}
      />

      <LiquidGlass
        radius={24}
        intensity="default"
        className="relative overflow-hidden bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-medium">{tabLabel}</h2>
              {isFetching && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-full shadow-2xs transition-all animate-in fade-in duration-150">
                  <Loader2Icon className="size-3 animate-spin shrink-0" />
                  <span>Memuat...</span>
                </div>
              )}
            </div>
            {hasSubPills && (
              <div className="mt-3">
                <OrderSubStatusPills
                  active={tab}
                  subFilter={subFilter}
                  onSubFilterChange={handleSubFilterChange}
                  isFetching={isFetching}
                />
              </div>
            )}
          </div>
          <Can permission="export-pesanan">
            <div className="flex items-center gap-2">
              {tab === "cancellation" && <ExportCancelDialog />}
              <ExportOrdersDialog tab={tab} />
            </div>
          </Can>
        </div>

        <OrderFilters
          query={listSearch.search}
          onQueryChange={listSearch.setSearch}
          filters={filters}
          onChange={handleFilterChange}
          leading={selectAllCheckbox}
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
          tab={tab}
          trailing={
            <div className="flex items-center gap-2">
              <Can permission="import-pesanan">
                <Button asChild variant="outline" size="sm" className="h-9 rounded-full gap-1.5">
                  <Link href="/dashboard/pesanan/import">
                    <ImportIcon className="size-4" />
                    Import
                  </Link>
                </Button>
              </Can>
              <Can permission="create-pesanan">
                <Button asChild variant="primary" size="sm" className="h-9 rounded-full gap-1.5">
                  <Link href="/dashboard/pesanan/tambah">
                    <PlusIcon className="size-4" />
                    Buat Pesanan
                  </Link>
                </Button>
              </Can>
            </div>
          }
        />

        <div className="px-4 py-4 sm:px-5">
          <OrderCardList
            orders={orders}
            tab={tab}
            subFilter={subFilter}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isLoading={isLoading}
            page={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            perPage={meta.per_page}
            onPageChange={listSearch.setPage}
            onPerPageChange={(s) => {
              listSearch.setPerPage(s);
              listSearch.resetPage();
            }}
            isFetching={isFetching}
          />
        </div>
      </LiquidGlass>

      <BulkActionBar
        tab={tab}
        subFilter={subFilter}
        count={selectedIds.size}
        onClear={clearSelection}
        selectedIds={Array.from(selectedIds)}
        selectedLabelInputs={orders
          .filter((o) => selectedIds.has(o.id))
          .map((o) => ({ id: o.id, source: o.source }))}
        selectedOrders={orders.filter((o) => selectedIds.has(o.id))}
      />
    </div>
  );
}
