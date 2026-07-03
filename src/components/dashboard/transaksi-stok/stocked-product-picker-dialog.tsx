"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Loader2Icon, SearchIcon, SearchXIcon } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { InventoryStockService } from "@/services/persediaan/inventory.service";

export interface StockedPickedProduct {
  itemId: string;
  sku: string;
  name: string;
  variantLabel: string;
  thumbnail: string | null;
  totalOnHand: number;
}

interface StockedProductPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (products: StockedPickedProduct[]) => void;
  locationId: string;
  excludeIds?: string[];
  initialSearch?: string;
}

export function StockedProductPickerDialog({
  open,
  onOpenChange,
  onPick,
  locationId,
  excludeIds = [],
  initialSearch,
}: StockedProductPickerDialogProps) {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<
    Map<string, StockedPickedProduct>
  >(new Map());
  const [page, setPage] = React.useState(1);
  const perPage = 20;

  React.useEffect(() => {
    if (open && initialSearch) {
      setSearchInput(initialSearch);
      setSearch(initialSearch);
    }
  }, [open, initialSearch]);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(1);
  }, [search, locationId]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["stocked-items", locationId, search, page, perPage],
    enabled: open && !!locationId,
    placeholderData: keepPreviousData,
    queryFn: () =>
      InventoryStockService.stockedItems({
        locationId,
        search: search || undefined,
        page,
        perPage,
      }),
    staleTime: 30 * 1000,
  });

  const rows = (data?.data ?? []).filter((r) => !excludeIds.includes(r.item_id));
  const total = data?.meta?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / perPage));

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSearchInput("");
      setSearch("");
      setSelected(new Map());
      setPage(1);
    }
    onOpenChange(next);
  };

  const toggle = (item: (typeof rows)[number], checked: boolean) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (checked) {
        next.set(item.item_id, {
          itemId: item.item_id,
          sku: item.sku,
          name: item.product_name ?? item.sku,
          variantLabel: item.variant_label ?? "",
          thumbnail: item.thumbnail_url,
          totalOnHand: item.total_on_hand,
        });
      } else {
        next.delete(item.item_id);
      }
      return next;
    });
  };

  const handleAdd = () => {
    onPick(Array.from(selected.values()));
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Pilih Produk</DialogTitle>
          <DialogDescription>
            Hanya menampilkan produk yang punya stok di gudang ini.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama produk / SKU..."
            className="pl-9"
          />
        </div>

        <div className="max-h-[420px] overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Produk</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Varian</TableHead>
                <TableHead className="text-right">Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    <Loader2Icon className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <SearchXIcon className="h-6 w-6 opacity-50" />
                      <p className="text-sm">
                        Tidak ada produk berstok di gudang ini
                        {search ? ` untuk pencarian "${search}"` : ""}.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const isSelected = selected.has(r.item_id);
                  return (
                    <TableRow
                      key={r.item_id}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-primary/5",
                      )}
                      onClick={() => toggle(r, !isSelected)}
                    >
                      <TableCell className="w-10">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(v) => toggle(r, !!v)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {r.thumbnail_url ? (
                            <Image
                              src={r.thumbnail_url}
                              alt={r.product_name ?? r.sku}
                              width={36}
                              height={36}
                              className="h-9 w-9 shrink-0 rounded-md border border-border object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                              <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          )}
                          <span className="text-sm font-medium">
                            {r.product_name ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.sku}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.variant_label || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {r.total_on_hand}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {selected.size} dipilih
            {isFetching && !isLoading ? " · memuat…" : ""}
          </span>
          <SimplePagination
            page={page}
            lastPage={lastPage}
            onPageChange={setPage}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleAdd} disabled={selected.size === 0}>
            Tambah ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
