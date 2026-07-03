"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PackageIcon,
  MapPinIcon,
  BoxIcon,
} from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SimplePagination,
  TABLE_PAGE_SIZES,
} from "@/components/ui/simple-pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { PageTitle } from "@/components/dashboard/page-title";
import { FilterToolbar } from "@/components/dashboard/shared/filter-toolbar";
import {
  useStockItem,
  useStockMovements,
  useItemStock,
  useMovementFilters,
} from "@/hooks/persediaan/use-stock-position";
import type {
  StockMovement,
  BinInventory,
  MovementView,
} from "@/types/persediaan/stock";
import { formatCurrency } from "@/lib/format";

const CATEGORY_COLOR: Record<string, string> = {
  BILL: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20",
  ADJUSTMENT:
    "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  PURCHASE_RETURN:
    "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
  SALES_RETURN:
    "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-500/10 dark:border-teal-500/20",
  PICKING:
    "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  INVOICE:
    "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20",
  TRANSFER:
    "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  REVALUATION:
    "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20",
};

const VIEW_TABS: {
  value: MovementView;
  label: string;
  description: string;
}[] = [
  {
    value: "clean",
    label: "Kronologi Bersih",
    description:
      "Pergerakan stok yang sudah jelas: pick per-scan, transfer, retur, adjustment.",
  },
  {
    value: "all",
    label: "Semua",
    description: "Semua sumber, termasuk Faktur.",
  },
  {
    value: "attention",
    label: "Perlu Perhatian",
    description:
      "Entri Faktur — indikasi stok nyangkut / kesalahan scan lokasi yang perlu ditelusuri.",
  },
];

const ALL_VALUE = "__all__";

function resolveTransactionHref(source: string, trxNo: string): string | null {
  const enc = encodeURIComponent(trxNo);
  switch (source) {
    case "BILL":
      return `/dashboard/transaksi-pembelian/tagihan?q=${enc}`;
    case "ADJUSTMENT":
    case "STOCK_OPNAME":
      return `/dashboard/transaksi-stok/penyesuaian?q=${enc}`;
    case "PURCHASE_RETURN":
      return `/dashboard/barang-keluar/retur-pembelian?q=${enc}`;
    case "SALES_RETURN":
      return `/dashboard/barang-masuk/retur-channel?q=${enc}`;
    case "INVOICE":
    case "ORDER_SHIP":
    case "ORDER_PICK":
    case "ORDER_RESTORE":
      return `/dashboard/pesanan?q=${enc}`;
    case "TRANSFER_IN":
      return `/dashboard/barang-masuk/transfer-masuk?q=${enc}`;
    case "TRANSFER_OUT":
      return `/dashboard/barang-keluar/transfer-keluar?q=${enc}`;
    case "BIN_TRANSFER_IN":
    case "BIN_TRANSFER_OUT":
      return `/dashboard/transaksi-stok/transfer?q=${enc}`;
    case "PUTAWAY_IN":
    case "PUTAWAY_OUT":
      return `/dashboard/barang-masuk/penempatan?q=${enc}`;
    case "REVALUATION":
      return `/dashboard/transaksi-stok/revaluasi?q=${enc}`;
    default:
      return null;
  }
}

function SourceBadge({
  category,
  label,
  isVariance,
}: {
  category: string;
  label: string;
  isVariance?: boolean;
}) {
  const color =
    CATEGORY_COLOR[category] ?? "text-muted-foreground bg-muted border-border";
  const title = isVariance
    ? "Faktur — kemungkinan stok nyangkut akibat kesalahan scan lokasi. Perlu ditelusuri."
    : undefined;
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-medium", color)}
      title={title}
    >
      {label}
    </Badge>
  );
}

function QtyCell({ qty }: { qty: number }) {
  const isPositive = qty > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-sm font-semibold tabular-nums",
        isPositive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-500 dark:text-red-400",
      )}
    >
      {isPositive ? (
        <ArrowUpIcon className="h-3 w-3" />
      ) : (
        <ArrowDownIcon className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {qty}
    </span>
  );
}

function StockSummaryCards({
  onHand,
  onOrder,
  reserved,
  available,
  avgCost,
}: {
  onHand: number;
  onOrder: number;
  reserved: number;
  available: number;
  avgCost: number;
}) {
  const cards = [
    { label: "On Hand", value: onHand, color: "" },
    { label: "On Order", value: onOrder, color: "" },
    {
      label: "Reserved",
      value: reserved,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Available",
      value: available,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Harga Pokok",
      value: formatCurrency(avgCost),
      color: "text-muted-foreground",
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <LiquidGlass
          key={c.label}
          radius={14}
          intensity="subtle"
          className="bg-white/30 px-4 py-3 dark:bg-white/[0.04]"
        >
          <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
          <p className={cn("mt-1 text-xl font-bold tabular-nums", c.color)}>
            {c.isText ? c.value : c.value}
          </p>
        </LiquidGlass>
      ))}
    </div>
  );
}

function MovementsSection({ itemId }: { itemId: string }) {
  const [view, setView] = useState<MovementView>("clean");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [source, setSource] = useState("");
  const [direction, setDirection] = useState<"" | "in" | "out">("");
  const [locationId, setLocationId] = useState("");
  const [storeId, setStoreId] = useState("");

  const { data: filterOptions } = useMovementFilters();
  const sourceOptions = filterOptions?.data?.sources ?? [];
  const directionOptions = filterOptions?.data?.directions ?? [];
  const locationOptions = filterOptions?.data?.locations ?? [];
  const storeOptions = filterOptions?.data?.stores ?? [];

  const params = useMemo(
    () => ({
      "filter[item_id]": itemId,
      "filter[source]": source || undefined,
      "filter[direction]": direction || undefined,
      "filter[location_id]": locationId || undefined,
      "filter[store_id]": storeId || undefined,
      view,
      page,
      per_page: perPage,
      sort: "-transaction_date",
    }),
    [itemId, source, direction, locationId, storeId, view, page, perPage],
  );

  const { data, isLoading } = useStockMovements(params);
  const movements = data?.data ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  };

  const activeCount = [source, direction, locationId, storeId].filter(
    Boolean,
  ).length;
  const hasActiveFilter = activeCount > 0;

  const viewBar = (
    <div
      role="tablist"
      aria-label="Filter kronologi stok"
      className="flex flex-wrap items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1"
    >
      {VIEW_TABS.map((t) => {
        const isActive = view === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            title={t.description}
            onClick={() => {
              setView(t.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );

  const filterBar = (
    <FilterToolbar
      align="end"
      hasFilter={hasActiveFilter}
      activeCount={activeCount}
      onReset={
        hasActiveFilter
          ? () => {
              setSource("");
              setDirection("");
              setLocationId("");
              setStoreId("");
              setPage(1);
            }
          : undefined
      }
      gridCols={2}
    >
      <Select
        value={source || ALL_VALUE}
        onValueChange={(v) => {
          setSource(v === ALL_VALUE ? "" : v);
          setPage(1);
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-full border-border bg-background">
          <SelectValue placeholder="Pilih sumber" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Semua Sumber</SelectItem>
          {sourceOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={direction || ALL_VALUE}
        onValueChange={(v) => {
          setDirection((v === ALL_VALUE ? "" : v) as "" | "in" | "out");
          setPage(1);
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-full border-border bg-background">
          <SelectValue placeholder="Pilih mutasi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Semua Mutasi</SelectItem>
          {directionOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={locationId || ALL_VALUE}
        onValueChange={(v) => {
          setLocationId(v === ALL_VALUE ? "" : v);
          setPage(1);
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-full border-border bg-background">
          <SelectValue placeholder="Pilih lokasi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Semua Lokasi</SelectItem>
          {locationOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={storeId || ALL_VALUE}
        onValueChange={(v) => {
          setStoreId(v === ALL_VALUE ? "" : v);
          setPage(1);
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-full border-border bg-background">
          <SelectValue placeholder="Pilih toko" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Semua Toko</SelectItem>
          {storeOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterToolbar>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {viewBar}
        {filterBar}
        <div className="space-y-2 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {viewBar}
        {filterBar}
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <PackageIcon className="h-8 w-8" />
          <p className="text-sm font-medium">
            {view === "attention"
              ? "Tidak ada entri Faktur di rentang ini — stok bersih."
              : "Belum ada kronologi stok"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {viewBar}
      {filterBar}
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/60 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
              Tanggal
            </TableHead>
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
              Lokasi
            </TableHead>
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
              Kode Rak
            </TableHead>
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
              No. Transaksi
            </TableHead>
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
              Sumber
            </TableHead>
            <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">
              Qty
            </TableHead>
            <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">
              Sisa
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m: StockMovement) => (
            <TableRow
              key={m.id}
              className="border-b border-border/30 transition-colors hover:bg-muted/30"
            >
              <TableCell className="px-3 py-2.5 text-muted-foreground">
                {format(new Date(m.transaction_date), "dd MMM yyyy HH:mm", {
                  locale: idLocale,
                })}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                  {m.location_name}
                </span>
              </TableCell>
              <TableCell className="px-3 py-2.5">
                {m.bin_code ? (
                  <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium">
                    {m.bin_code}
                  </code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                {(() => {
                  const href = resolveTransactionHref(
                    m.source,
                    m.transaction_number,
                  );
                  return href ? (
                    <Link
                      href={href}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {m.transaction_number}
                    </Link>
                  ) : (
                    <span className="font-mono text-xs">
                      {m.transaction_number}
                    </span>
                  );
                })()}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <SourceBadge
                  category={m.source_category}
                  label={m.source_label}
                  isVariance={m.is_variance}
                />
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right">
                <QtyCell qty={m.qty} />
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right font-mono text-sm tabular-nums">
                {m.balance}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="px-3">
        <SimplePagination
          page={meta.current_page}
          lastPage={meta.last_page}
          onPageChange={setPage}
          perPage={meta.per_page}
          onPerPageChange={(s) => {
            setPerPage(s);
            setPage(1);
          }}
          pageSizeOptions={TABLE_PAGE_SIZES}
          total={meta.total}
          label="mutasi"
        />
      </div>
    </div>
  );
}

function BinSection({ itemId }: { itemId: string }) {
  const { data, isLoading } = useItemStock(itemId);
  const bins: BinInventory[] = data?.data ?? [];

  const [locationId, setLocationId] = useState("");
  const [floor, setFloor] = useState("");
  const [row, setRow] = useState("");
  const [col, setCol] = useState("");

  const locationOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const b of bins)
      if (b.location_id && !seen.has(b.location_id))
        seen.set(b.location_id, b.location_name);
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [bins]);

  const floorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const b of bins) {
      if (locationId && b.location_id !== locationId) continue;
      if (b.floor_code) set.add(b.floor_code);
    }
    return Array.from(set)
      .sort()
      .map((v) => ({ value: v, label: v }));
  }, [bins, locationId]);

  const rowOptions = useMemo(() => {
    const set = new Set<string>();
    for (const b of bins) {
      if (locationId && b.location_id !== locationId) continue;
      if (floor && b.floor_code !== floor) continue;
      if (b.row_code) set.add(b.row_code);
    }
    return Array.from(set)
      .sort()
      .map((v) => ({ value: v, label: v }));
  }, [bins, locationId, floor]);

  const colOptions = useMemo(() => {
    const set = new Set<string>();
    for (const b of bins) {
      if (locationId && b.location_id !== locationId) continue;
      if (floor && b.floor_code !== floor) continue;
      if (row && b.row_code !== row) continue;
      if (b.column_code) set.add(b.column_code);
    }
    return Array.from(set)
      .sort()
      .map((v) => ({ value: v, label: v }));
  }, [bins, locationId, floor, row]);

  const filtered = useMemo(
    () =>
      bins.filter((b) => {
        if (locationId && b.location_id !== locationId) return false;
        if (floor && b.floor_code !== floor) return false;
        if (row && b.row_code !== row) return false;
        if (col && b.column_code !== col) return false;
        return true;
      }),
    [bins, locationId, floor, row, col],
  );

  const activeCount = [locationId, floor, row, col].filter(Boolean).length;
  const hasFilter = activeCount > 0;

  const filterBar = (
    <FilterToolbar
      align="end"
      hasFilter={hasFilter}
      activeCount={activeCount}
      onReset={
        hasFilter
          ? () => {
              setLocationId("");
              setFloor("");
              setRow("");
              setCol("");
            }
          : undefined
      }
      gridCols={2}
    >
      <Select
        value={locationId || ALL_VALUE}
        onValueChange={(v) => {
          setLocationId(v === ALL_VALUE ? "" : v);
          setFloor("");
          setRow("");
          setCol("");
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-full border-border bg-background">
          <SelectValue placeholder="Pilih lokasi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Semua Lokasi</SelectItem>
          {locationOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Combobox
        options={[{ value: "", label: "Semua Lantai" }, ...floorOptions]}
        value={floor}
        onChange={(v) => {
          setFloor(v ?? "");
          setRow("");
          setCol("");
        }}
        placeholder="Pilih lantai"
        searchPlaceholder="Cari lantai"
        className="h-9 bg-background"
      />
      <Combobox
        options={[{ value: "", label: "Semua Baris" }, ...rowOptions]}
        value={row}
        onChange={(v) => {
          setRow(v ?? "");
          setCol("");
        }}
        placeholder="Pilih baris"
        searchPlaceholder="Cari baris"
        className="h-9 bg-background"
      />
      <Combobox
        options={[{ value: "", label: "Semua Kolom" }, ...colOptions]}
        value={col}
        onChange={(v) => setCol(v ?? "")}
        placeholder="Pilih kolom"
        searchPlaceholder="Cari kolom"
        className="h-9 bg-background"
      />
    </FilterToolbar>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {filterBar}
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (bins.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {filterBar}
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <BoxIcon className="h-8 w-8" />
          <p className="text-sm font-medium">
            Belum ada data persediaan di rak
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filterBar}
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/60 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
              Lokasi
            </TableHead>
            <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
              Kode Rak
            </TableHead>
            <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">
              On Hand
            </TableHead>
            <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">
              Reserved
            </TableHead>
            <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">
              Available
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((b: BinInventory) => (
            <TableRow
              key={b.id}
              className="border-b border-border/30 transition-colors hover:bg-muted/30"
            >
              <TableCell className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                  {b.location_name}
                </span>
              </TableCell>
              <TableCell className="px-3 py-2.5">
                {b.bin_code ? (
                  <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium">
                    {b.bin_code}
                  </code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums">
                {b.on_hand}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right tabular-nums text-orange-600 dark:text-orange-400">
                {b.reserved}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {b.available}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function StockPositionDetailView({ itemId }: { itemId: string }) {
  const [activeTab, setActiveTab] = useState<"kronologi" | "rak">("kronologi");

  const { data, isLoading } = useStockItem(itemId);
  const item = data?.data ?? null;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={isLoading ? "Memuat..." : (item?.item_code ?? "Detail Stok")}
        description={isLoading ? "" : (item?.item_name ?? "")}
        backHref="/dashboard/posisi-stok"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Persediaan" },
          { label: "Posisi Stok", href: "/dashboard/posisi-stok" },
          { label: item?.item_code ?? "Detail" },
        ]}
      />

      {}
      {isLoading ? (
        <LiquidGlass
          radius={20}
          intensity="subtle"
          className="bg-white/30 p-5 dark:bg-white/[0.04]"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </LiquidGlass>
      ) : item ? (
        <>
          <LiquidGlass
            radius={20}
            intensity="subtle"
            className="bg-white/30 p-5 dark:bg-white/[0.04]"
          >
            <div className="flex items-center gap-4">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.item_name ?? item.item_code}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-xl border border-border/60 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                  <PackageIcon className="h-8 w-8 text-muted-foreground/60" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold leading-tight">
                  {item.item_name || item.item_code}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.item_code}
                </p>
                {item.variation_values.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.variation_values.map((v) => (
                      <Badge
                        key={`${v.label}-${v.value}`}
                        variant="secondary"
                        className="text-xs"
                      >
                        {v.value}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </LiquidGlass>

          <StockSummaryCards
            onHand={item.total_stocks.on_hand}
            onOrder={item.total_stocks.on_order}
            reserved={item.total_stocks.reserved}
            available={item.total_stocks.available}
            avgCost={Number(item.average_cost)}
          />
        </>
      ) : (
        <LiquidGlass
          radius={20}
          intensity="subtle"
          className="bg-white/30 p-8 dark:bg-white/[0.04]"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <PackageIcon className="h-10 w-10" />
            <p className="text-sm font-medium">Produk tidak ditemukan</p>
          </div>
        </LiquidGlass>
      )}

      {}
      {item && (
        <LiquidGlass
          radius={20}
          intensity="subtle"
          className="bg-white/30 dark:bg-white/[0.04]"
        >
          <div className="border-b border-border/60">
            <div className="flex gap-0 px-5">
              <button
                type="button"
                onClick={() => setActiveTab("kronologi")}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === "kronologi"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Kronologi Stok
                {activeTab === "kronologi" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rak")}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === "rak"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Persediaan di Rak
                {activeTab === "rak" && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === "kronologi" ? (
              <MovementsSection itemId={item.item_id} />
            ) : (
              <BinSection itemId={item.item_id} />
            )}
          </div>
        </LiquidGlass>
      )}
    </div>
  );
}
