"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PencilIcon,
  PlusIcon,
  SearchIcon,
  StoreIcon,
  Trash2Icon,
} from "lucide-react";

import { PageTitle } from "@/components/dashboard/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useDeleteInternalStore,
  useInternalStores,
} from "@/hooks/penjualan/use-internal-stores";

export function TokoInternalView() {
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 250);

  const { data, isLoading } = useInternalStores({
    page,
    per_page: 20,
    search: debouncedQuery || undefined,
    "filter[is_active]": onlyActive ? 1 : undefined,
  });

  const deleteMut = useDeleteInternalStore();

  const items = data?.items ?? [];
  const meta = data?.meta;

  const emptyMessage = useMemo(() => {
    if (isLoading) return "Memuat…";
    if (debouncedQuery) return `Tidak ada toko yang cocok dengan "${debouncedQuery}".`;
    return "Belum ada toko internal.";
  }, [debouncedQuery, isLoading]);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Toko Internal"
        breadcrumb={[{ label: "Penjualan" }, { label: "Toko Internal" }]}
        actions={
          <Button asChild>
            <Link href="/dashboard/toko-internal/tambah">
              <PlusIcon className="mr-1 size-4" />
              Tambah Toko
            </Link>
          </Button>
        }
      />

      <LiquidGlass radius={16} className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama atau kode toko"
              className="pl-9"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={onlyActive} onCheckedChange={setOnlyActive} />
            Hanya aktif
          </label>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Logo</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div className="relative size-10 overflow-hidden rounded-lg border border-border bg-muted/40">
                        {store.logo_thumb || store.logo_url ? (
                          <Image
                            src={store.logo_thumb ?? store.logo_url!}
                            alt={store.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <StoreIcon className="size-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {store.code}
                    </TableCell>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>
                      {store.is_active ? (
                        <Badge variant="secondary">Aktif</Badge>
                      ) : (
                        <Badge variant="outline">Nonaktif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/dashboard/toko-internal/${store.id}`}>
                            <PencilIcon className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingDelete(store.id)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Menampilkan {items.length} dari {meta.total} toko
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.current_page <= 1}
              >
                Sebelumnya
              </Button>
              <span>
                Halaman {meta.current_page} / {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={meta.current_page >= meta.last_page}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </LiquidGlass>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title="Hapus toko internal?"
        description="Toko yang sudah pernah dipakai di pesanan tidak akan hilang dari pesanan tersebut, tapi tidak bisa lagi dipilih di form baru."
        confirmLabel="Hapus"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteMut.mutateAsync(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
