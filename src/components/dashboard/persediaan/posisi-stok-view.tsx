"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PackageIcon,
  ArrowUpDown,
  ChevronUpIcon,
  ChevronDownIcon,
  BoxesIcon,
  BoxIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SimplePagination,
  TABLE_PAGE_SIZES,
} from "@/components/ui/simple-pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InfoIcon } from "lucide-react";
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import { CopySku } from "@/components/dashboard/shared/copy-sku";
import {
  useStockPosition,
  usePrefetchStockDetail,
} from "@/hooks/persediaan/use-stock-position";
import type { StockItem, StockListParams } from "@/types/persediaan/stock";
import { formatCurrency } from "@/lib/format";

type SortField = "item_code" | "average_cost" | "on_hand" | "available";
type SortDir = "asc" | "desc";
type StockFilter = "all" | "single" | "bundle";

const STOCK_FILTER_TABS: {
  key: StockFilter;
  label: string;
  icon: typeof PackageIcon;
}[] = [
  { key: "all", label: "Semua", icon: PackageIcon },
  { key: "single", label: "Satuan", icon: BoxIcon },
  { key: "bundle", label: "Bundle", icon: BoxesIcon },
];

interface FilterState {
  location_id: string;
  channel: string;
}

const EMPTY_FILTERS: FilterState = { location_id: "", channel: "" };

function SortHeader({
  label,
  field,
  activeField,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  field: SortField;
  activeField: SortField | null;
  dir: SortDir;
  onSort: (f: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = activeField === field;
  return (
    <TableHead
      className={cn(
        "whitespace-nowrap px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground",
        "cursor-pointer select-none transition-colors hover:text-foreground",
        align === "right" && "text-right",
      )}
      onClick={() => onSort(field)}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1",
          align === "right" && "justify-end",
        )}
      >
        {label}
        {isActive ? (
          dir === "asc" ? (
            <ChevronUpIcon className="size-3" />
          ) : (
            <ChevronDownIcon className="size-3" />
          )
        ) : (
          <ArrowUpDown className="size-3 opacity-40" />
        )}
      </span>
    </TableHead>
  );
}

function StockSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 px-3 py-3">
        <div className="flex gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="border-b border-border/20 px-3 py-3.5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex flex-1 gap-4">
              <Skeleton className="size-40" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StockQtyBadge({
  value,
  variant,
}: {
  value: number;
  variant: "default" | "warning" | "success";
}) {
  const colors = {
    default: "",
    warning: value > 0 ? "text-warning" : "",
    success: value > 0 ? "text-success" : "",
  };
  return (
    <span
      className={cn(
        "font-mono text-sm font-semibold tabular-nums",
        colors[variant],
      )}
    >
      {value}
    </span>
  );
}


export function PosisiStokView() {
  const router = useRouter();
  const prefetchStockDetail = usePrefetchStockDetail();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const resetPage = useCallback(() => setPage(1), []);

  const prefetchDetail = useCallback(
    (itemId: string) => {
      router.prefetch(`/dashboard/posisi-stok/${itemId}`);
      prefetchStockDetail(itemId);
    },
    [router, prefetchStockDetail],
  );

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      resetPage();
    }, 350);
    return () => clearTimeout(t);
  }, [search, resetPage]);

  const handleSort = useCallback(
    (field: SortField) => {
      setSortField((prev) => {
        if (prev === field) {
          setSortDir((d) => (d === "asc" ? "desc" : "asc"));
          return field;
        }
        setSortDir("asc");
        return field;
      });
      resetPage();
    },
    [resetPage],
  );

  const handleStockFilter = useCallback(
    (f: StockFilter) => {
      setStockFilter(f);
      resetPage();
    },
    [resetPage],
  );

  const handleFilterChange = useCallback(
    (f: FilterState) => {
      setFilters(f);
      resetPage();
    },
    [resetPage],
  );

  const SERVER_SORT_MAP: Partial<Record<SortField, string>> = {
    item_code: "product_variants.sku",
  };

  const sortParam = useMemo(() => {
    if (!sortField) return undefined;
    const mapped = SERVER_SORT_MAP[sortField];
    if (!mapped) return undefined;
    return sortDir === "desc" ? `-${mapped}` : mapped;
  }, [sortField, sortDir]);

  const bundleFilter = useMemo(() => {
    if (stockFilter === "bundle") return "1";
    if (stockFilter === "single") return "0";
    return undefined;
  }, [stockFilter]);

  const params = useMemo<StockListParams>(
    () => ({
      search: debouncedSearch || undefined,
      page,
      per_page: perPage,
      sort: sortParam,
      "filter[is_bundle]": bundleFilter,
      "filter[location_id]": filters.location_id || undefined,
      "filter[channel]": filters.channel || undefined,
    }),
    [
      debouncedSearch,
      page,
      perPage,
      sortParam,
      bundleFilter,
      filters.location_id,
      filters.channel,
    ],
  );

  const { data, isLoading, isFetching } = useStockPosition(params);

  const items = useMemo(() => {
    const raw = data?.data ?? [];
    if (!sortField || SERVER_SORT_MAP[sortField]) return raw;
    return [...raw].sort((a, b) => {
      let av: number, bv: number;
      switch (sortField) {
        case "average_cost":
          av = Number(a.average_cost);
          bv = Number(b.average_cost);
          break;
        case "on_hand":
          av = a.total_stocks.on_hand;
          bv = b.total_stocks.on_hand;
          break;
        case "available":
          av = a.total_stocks.available;
          bv = b.total_stocks.available;
          break;
        default:
          return 0;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [data?.data, sortField, sortDir]);

  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
    channels: [],
    locations: [],
  };

  const locationOptions = useMemo(
    () => [
      { value: "", label: "Semua Lokasi" },
      ...meta.locations.map((l) => ({
        value: l.location_id,
        label: l.location_name,
      })),
    ],
    [meta.locations],
  );

  const channelOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of meta.channels) {
      if (c.channel_code && !seen.has(c.channel_code)) {
        seen.set(c.channel_code, c.channel_name);
      }
    }
    return [
      { value: "", label: "Semua Channel" },
      ...Array.from(seen, ([value, label]) => ({ value, label })),
    ];
  }, [meta.channels]);

  const hasActiveFilter = Object.values(filters).some(Boolean);
  const activeCount = [filters.location_id, filters.channel].filter(
    Boolean,
  ).length;

  const filterTabs = (
    <Tabs value={stockFilter || ""} onValueChange={(val) => handleStockFilter(val as any)}>
      <TabsList variant="line" className="h-auto">
        {STOCK_FILTER_TABS.map(({ key, label, icon: Icon }) => (
          <TabsTrigger key={key} value={key}>
            <Icon />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <FilterToolbar
          search={search}
          onSearchChange={handleSearch}
          searchPlaceholder="Cari produk atau SKU..."
          align="end"
          leading={filterTabs}
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

          <Combobox
            options={channelOptions}
            value={filters.channel}
            onChange={(v) =>
              handleFilterChange({ ...filters, channel: v ?? "" })
            }
            placeholder="Channel"
            searchPlaceholder="Cari channel"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        {isFetching && !isLoading && (
          <div className="flex justify-center py-1">
            <Loader2Icon className="size-4 animate-spin text-primary" />
          </div>
        )}

        <div className="px-4 py-3 sm:px-5">
          {isLoading ? (
            <StockSkeleton />
          ) : items.length === 0 ? (
            <EmptyState icon={PackageIcon} title="Belum ada data stok" description="Produk yang memiliki stok akan muncul di sini." />
          ) : (
            <div className="flex flex-col gap-3">
              <Table containerClassName="rounded-lg border border-border/40">
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/30">
                    <SortHeader
                      label="Produk"
                      field="item_code"
                      activeField={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <TableHead
                      className={cn(
                        "whitespace-nowrap px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground",
                        "cursor-pointer select-none transition-colors hover:text-foreground",
                      )}
                      onClick={() => handleSort("average_cost")}
                    >
                      <span className="inline-flex items-center justify-end gap-1">
                        Harga Pokok
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon
                              className="size-3 opacity-60"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            Metode valuasi: Moving Average (rata-rata
                            tertimbang).
                          </TooltipContent>
                        </Tooltip>
                        {sortField === "average_cost" ? (
                          sortDir === "asc" ? (
                            <ChevronUpIcon className="size-3" />
                          ) : (
                            <ChevronDownIcon className="size-3" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3 opacity-40" />
                        )}
                      </span>
                    </TableHead>
                    <SortHeader
                      label="On Hand"
                      field="on_hand"
                      activeField={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                      align="right"
                    />
                    <TableHead className="whitespace-nowrap px-3 py-3 text-right text-xs text-muted-foreground uppercase tracking-wider text-muted-foreground">
                      On Order
                    </TableHead>
                    <TableHead className="whitespace-nowrap px-3 py-3 text-right text-xs text-muted-foreground uppercase tracking-wider text-muted-foreground">
                      Reserved
                    </TableHead>
                    <SortHeader
                      label="Available"
                      field="available"
                      activeField={sortField}
                      dir={sortDir}
                      onSort={handleSort}
                      align="right"
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: StockItem) => (
                    <TableRow
                      key={item.item_id}
                      onClick={() =>
                        router.push(`/dashboard/posisi-stok/${item.item_id}`)
                      }
                      onMouseEnter={() => prefetchDetail(item.item_id)}
                      onFocus={() => prefetchDetail(item.item_id)}
                      className="cursor-pointer border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <TableCell className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.item_name ?? item.item_code}
                              width={40}
                              height={40}
                              className="h-10 w-10 shrink-0 rounded-xl border border-border/40 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                              <PackageIcon className="size-5 text-muted-foreground/60" />
                            </div>
                          )}
                          <div
                            className="flex min-w-0 flex-col gap-0.5"
                            style={{ maxWidth: 320 }}
                          >
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="whitespace-normal break-words text-sm font-medium text-foreground">
                                {item.item_name || item.item_code}
                              </span>
                              {item.is_bundle && (
                                <Badge
                                  variant="outline"
                                  className="shrink-0 text-2xs leading-tight border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400"
                                >
                                  Bundle
                                </Badge>
                              )}
                            </div>
                            {item.variation_values.length > 0 && (
                              <span className="whitespace-normal break-words text-xs text-foreground">
                                {item.variation_values
                                  .map((v) => v.value)
                                  .join(", ")}
                              </span>
                            )}
                            <CopySku sku={item.item_code} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-3 text-right text-sm text-foreground">
                        {formatCurrency(Number(item.average_cost))}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-3 text-right">
                        <StockQtyBadge
                          value={item.total_stocks.on_hand}
                          variant="default"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-3 text-right">
                        <StockQtyBadge
                          value={item.total_stocks.on_order}
                          variant="default"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-3 text-right">
                        <StockQtyBadge
                          value={item.total_stocks.reserved}
                          variant="warning"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-3 text-right">
                        <StockQtyBadge
                          value={item.total_stocks.available}
                          variant="success"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <SimplePagination
                page={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={setPage}
                perPage={meta.per_page}
                onPerPageChange={(s) => {
                  setPerPage(s);
                  resetPage();
                }}
                pageSizeOptions={TABLE_PAGE_SIZES}
                total={meta.total}
                label="produk"
              />
            </div>
          )}
        </div>
      </LiquidGlass>
    </div>
  );
}
