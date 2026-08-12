"use client";

import { useState } from "react";
import { ClockIcon, MessageCircleQuestionIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBuyerConfirmations } from "@/hooks/pesanan/use-direct-completion";
import { formatDateTime } from "@/lib/format";
import type { BuyerConfirmation } from "@/types/pesanan/direct-completion";
import { BuyerConfirmationDialog } from "./buyer-confirmation-dialog";

type State = "awaiting" | "waiting-stock";

export function BuyerConfirmationView() {
  const [state, setState] = useState<State>("awaiting");
  const [selected, setSelected] = useState<BuyerConfirmation | null>(null);

  const query = useBuyerConfirmations(state);
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-4">
      <Tabs value={state} onValueChange={(value) => setState(value as State)}>
        <TabsList>
          <TabsTrigger value="awaiting">
            <MessageCircleQuestionIcon className="mr-1.5 size-3.5" />
            Menunggu Konfirmasi
          </TabsTrigger>
          <TabsTrigger value="waiting-stock">
            <ClockIcon className="mr-1.5 size-3.5" />
            Menunggu Stok
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {query.isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title={
            state === "awaiting"
              ? "Tidak ada pesanan yang menunggu konfirmasi"
              : "Tidak ada pesanan yang menunggu stok"
          }
          description={
            state === "awaiting"
              ? "Pesanan muncul di sini saat stok Gudang Kecil tidak mencukupi."
              : "Pesanan yang pembelinya setuju menunggu akan tampil di sini sampai stok masuk."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-4xl border border-border/60">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">No. Pesanan</TableHead>
                <TableHead className="w-40">Pembeli</TableHead>
                <TableHead className="w-36">SKU</TableHead>
                <TableHead className="w-20 text-right">Kurang</TableHead>
                <TableHead className="w-44">Dicatat</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-normal font-medium">
                    {row.salesorder_no ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {row.customer_name ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {row.sku ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.qty_short}
                  </TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">
                    {formatDateTime(row.raised_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {state === "awaiting" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setSelected(row)}
                      >
                        Catat Keputusan
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Menunggu transfer
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BuyerConfirmationDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        confirmation={selected}
        onDone={() => setSelected(null)}
      />
    </div>
  );
}
