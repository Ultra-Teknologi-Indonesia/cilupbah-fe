"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SimplePagination } from "@/components/ui/simple-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { useInboundReceipts } from "@/hooks/barang-masuk/use-inbound";
import type { Inbound } from "@/types/barang-masuk/inbound";

export function KronologiPenerimaanTab({ inbound }: { inbound: Inbound }) {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(50);
  const [userFilter, setUserFilter] = React.useState<string | null>(null);
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [debouncedFrom, setDebouncedFrom] = React.useState("");
  const [debouncedTo, setDebouncedTo] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFrom(dateFrom);
      setDebouncedTo(dateTo);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [dateFrom, dateTo]);

  const { data, isLoading, isFetching } = useInboundReceipts(inbound.id, {
    page,
    per_page: perPage,
    "filter[received_by_user_id]": userFilter ?? undefined,
    "filter[date_from]": debouncedFrom || undefined,
    "filter[date_to]": debouncedTo || undefined,
    sort: "-received_date",
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const staffOptions = React.useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of inbound.participants ?? []) {
      if (p.user_id) seen.set(p.user_id, p.name);
    }
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [inbound.participants]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-56 flex-col gap-1">
          <label className="text-xs text-muted-foreground">Staff</label>
          <Combobox
            options={staffOptions}
            value={userFilter}
            onChange={(v) => {
              setUserFilter(v ?? null);
              setPage(1);
            }}
            placeholder="Semua staff"
            searchPlaceholder="Cari staff…"
            emptyText="Tidak ada staff"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Dari tanggal</label>
          <Input
            type="datetime-local"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-56"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Sampai</label>
          <Input
            type="datetime-local"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-56"
          />
        </div>
        {(userFilter || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            onClick={() => {
              setUserFilter(null);
              setDateFrom("");
              setDateTo("");
              setPage(1);
            }}
          >
            Reset
          </Button>
        )}
        {isFetching && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2Icon className="size-3 animate-spin" /> Memuat…
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-40">Waktu</TableHead>
              <TableHead className="min-w-40">Staff</TableHead>
              <TableHead className="min-w-32">SKU</TableHead>
              <TableHead className="min-w-56">Produk</TableHead>
              <TableHead className="w-20 text-right">Qty</TableHead>
              <TableHead className="w-24">Kondisi</TableHead>
              <TableHead className="min-w-32">Bin</TableHead>
              <TableHead className="min-w-32">Batch / Serial</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  <Loader2Icon className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10">
                  <EmptyState
                    title="Belum ada kronologi"
                    description="Belum ada penerimaan yang tercatat untuk dokumen ini."
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const variant = r.inbound_item?.variant;
                const batchSerial = [r.batch_no, r.serial_no]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">
                      {formatDateTime(r.received_date)}
                    </TableCell>
                    <TableCell>
                      {r.received_by_user?.name ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {variant?.sku ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {variant?.product?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {r.qty}
                    </TableCell>
                    <TableCell>
                      {r.condition === "DAMAGE" ? (
                        <Badge variant="destructive">Rusak</Badge>
                      ) : (
                        <Badge variant="outline">Baik</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.bin?.bin_final_code ?? r.bin?.code ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {batchSerial || "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.last_page > 1 && (
        <SimplePagination
          page={page}
          lastPage={meta.last_page}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
          total={meta.total}
        />
      )}
    </div>
  );
}
