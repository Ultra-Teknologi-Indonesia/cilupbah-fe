"use client";

import * as React from "react";
import {
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Layers2Icon,
  Loader2Icon,
  LockIcon,
  SearchIcon,
  WandSparklesIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePermissions } from "@/hooks/auth/use-permissions";
import {
  useApplyMerge,
  useAutoMerge,
  useMergeCatalog,
  useMergeSuggestions,
} from "@/hooks/master-produk/use-product-merge";
import type {
  MergeFilter,
  MergeGroupProduct,
  MergeSuggestion,
} from "@/types/product-merge";
import { MergeApplyDialog } from "./merge-apply-dialog";
import { MergeGroupCard } from "./merge-group-card";
import { MergeSuggestionsPanel } from "./merge-suggestions-panel";

const PER_PAGE = 24;

const FILTER_TABS: { value: MergeFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "unmerged", label: "Belum digabung" },
  { value: "merged", label: "Tergabung" },
  { value: "hidden", label: "Disembunyikan" },
];

function pickLongestName(names: string[]): string {
  return names.reduce((a, b) => (b.length > a.length ? b : a), names[0] ?? "");
}

export function MergeCatalogView() {
  const { can, isLoading: permsLoading } = usePermissions();
  const canView = can("view-product-merge");
  const canMerge = can("merge-product");
  const canAuto = can("auto-merge-product");
  const canUnmerge = can("unmerge-product");
  const canHide = can("hide-product");

  const [filter, setFilter] = React.useState<MergeFilter>("all");
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Map<string, MergeGroupProduct>>(
    new Map(),
  );
  const [autoOpen, setAutoOpen] = React.useState(false);
  const [dialog, setDialog] = React.useState<{
    open: boolean;
    products: { id: string; name: string }[];
    defaultMasterName: string;
    source: "selection" | "suggestion";
  }>({ open: false, products: [], defaultMasterName: "", source: "selection" });

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const catalog = useMergeCatalog(
    { filter, search, page, perPage: PER_PAGE },
    canView,
  );
  const suggestionsQuery = useMergeSuggestions(
    search,
    canView && canMerge && filter !== "hidden",
  );
  const applyMerge = useApplyMerge();
  const autoMerge = useAutoMerge();

  const rows = catalog.data?.rows ?? [];
  const meta = catalog.data?.meta;
  const counts = meta?.counts;
  const lastPage = meta?.last_page ?? 1;

  const suggestions =
    canMerge && filter !== "hidden" ? (suggestionsQuery.data ?? []) : [];

  const changeFilter = (next: MergeFilter) => {
    setFilter(next);
    setPage(1);
  };

  const toggleProduct = (product: MergeGroupProduct) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.set(product.id, product);
      return next;
    });
  };

  const openSelectionDialog = () => {
    const products = Array.from(selected.values());
    setDialog({
      open: true,
      products: products.map((p) => ({ id: p.id, name: p.name })),
      defaultMasterName: pickLongestName(products.map((p) => p.name)),
      source: "selection",
    });
  };

  const openSuggestionDialog = (s: MergeSuggestion) => {
    setDialog({
      open: true,
      products: s.products.map((p) => ({ id: p.id, name: p.name })),
      defaultMasterName: s.suggested_master_name,
      source: "suggestion",
    });
  };

  const confirmMerge = (masterName: string) => {
    applyMerge.mutate(
      { masterName, productIds: dialog.products.map((p) => p.id) },
      {
        onSuccess: () => {
          setDialog((d) => ({ ...d, open: false }));
          if (dialog.source === "selection") setSelected(new Map());
        },
      },
    );
  };

  const selectedCount = selected.size;

  if (!permsLoading && !canView) {
    return (
      <EmptyState
        icon={LockIcon}
        title="Tidak punya akses"
        description="Anda tidak memiliki izin untuk melihat penggabungan produk."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => changeFilter(v as MergeFilter)}>
          <TabsList variant="glass" className="max-w-full overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
              >
                {tab.label}
                {counts && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">
                    {counts[tab.value]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {canAuto && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoOpen(true)}
            disabled={autoMerge.isPending}
          >
            {autoMerge.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <WandSparklesIcon />
            )}
            Gabung otomatis
          </Button>
        )}
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama produk, SKU, atau kategori..."
          className="pl-9"
        />
      </div>

      {suggestions.length > 0 && (
        <MergeSuggestionsPanel
          suggestions={suggestions}
          canMerge={canMerge}
          onMerge={openSuggestionDialog}
        />
      )}

      {catalog.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-4xl border border-border bg-card py-12 text-center">
          <AlertTriangleIcon className="size-8 text-destructive" />
          <div>
            <p className="font-medium">Gagal memuat katalog</p>
            <p className="text-sm text-muted-foreground">
              Periksa koneksi atau coba lagi.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => catalog.refetch()}
            disabled={catalog.isFetching}
          >
            Coba lagi
          </Button>
        </div>
      ) : catalog.isLoading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-4xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Layers2Icon}
          title="Tidak ada produk"
          description={
            search
              ? "Tidak ada produk yang cocok dengan pencarian."
              : "Belum ada produk pada filter ini."
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {rows.map((group) => (
            <MergeGroupCard
              key={group.norm_key || group.name}
              group={group}
              selectedIds={new Set(selected.keys())}
              onToggleProduct={toggleProduct}
              canUnmerge={canUnmerge}
              canHide={canHide}
            />
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Halaman {meta?.current_page ?? page} dari {lastPage}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || catalog.isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeftIcon />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= lastPage || catalog.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      )}

      {canMerge && selectedCount > 0 && (
        <div className="sticky bottom-4 z-10 mx-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-lg">
          <span className="text-sm font-medium">
            {selectedCount} produk dipilih
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Map())}
            >
              <XIcon />
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={selectedCount < 2}
              onClick={openSelectionDialog}
            >
              <Layers2Icon />
              Gabungkan
            </Button>
          </div>
        </div>
      )}

      <MergeApplyDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
        products={dialog.products}
        defaultMasterName={dialog.defaultMasterName}
        loading={applyMerge.isPending}
        onConfirm={confirmMerge}
      />

      <ConfirmDialog
        open={autoOpen}
        onOpenChange={setAutoOpen}
        title="Gabung otomatis semua kandidat?"
        description="Sistem menggabungkan produk kembar berdasarkan kemiripan nama dan kode SKU. Anda tetap bisa melepas gabungan setelahnya."
        confirmLabel="Gabung otomatis"
        loading={autoMerge.isPending}
        onConfirm={() =>
          autoMerge.mutate(undefined, {
            onSuccess: () => setAutoOpen(false),
          })
        }
      />
    </div>
  );
}
