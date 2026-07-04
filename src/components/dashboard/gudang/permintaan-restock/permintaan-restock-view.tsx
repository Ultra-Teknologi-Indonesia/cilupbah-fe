"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckIcon, ExternalLinkIcon, EyeIcon, XIcon } from "lucide-react";

import { PageTitle } from "@/components/dashboard/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import {
  useRejectReplenishment,
  useStockReplenishments,
} from "@/hooks/gudang/use-stock-replenishment";
import type {
  StockReplenishment,
  StockReplenishmentStatus,
} from "@/types/gudang/stock-replenishment";
import { AcceptReplenishmentDialog } from "./accept-replenishment-dialog";

const STATUS_TABS: Array<{ label: string; value: StockReplenishmentStatus | "ALL" }> = [
  { label: "Menunggu", value: "PENDING" },
  { label: "Disetujui", value: "ACCEPTED" },
  { label: "Ditolak", value: "REJECTED" },
  { label: "Selesai", value: "DONE" },
  { label: "Semua", value: "ALL" },
];

const STATUS_BADGE: Record<StockReplenishmentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  ACCEPTED: "bg-blue-100 text-blue-800 border-blue-200",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
  DONE: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function PermintaanRestockView() {
  const [status, setStatus] = useState<StockReplenishmentStatus | "ALL">(
    "PENDING",
  );
  const [acceptTarget, setAcceptTarget] = useState<StockReplenishment | null>(
    null,
  );
  const [rejectTarget, setRejectTarget] = useState<StockReplenishment | null>(
    null,
  );

  const params = useMemo(
    () => ({ status: status === "ALL" ? undefined : status, per_page: 30 }),
    [status],
  );

  const { data, isLoading } = useStockReplenishments(params);
  const rejectMut = useRejectReplenishment();

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Permintaan Pengisian Stok"
        breadcrumb={[
          { label: "Gudang" },
          { label: "Permintaan Pengisian Stok" },
        ]}
      />

      <LiquidGlass
        radius={999}
        intensity="subtle"
        className="w-fit bg-white/40 p-1 dark:bg-white/[0.06]"
      >
        <Tabs
          value={status}
          onValueChange={(v) =>
            setStatus(v as StockReplenishmentStatus | "ALL")
          }
        >
          <TabsList className="bg-transparent">
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </LiquidGlass>

      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Diminta</TableHead>
                <TableHead>Diminta Oleh</TableHead>
                <TableHead>Dari → Ke</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Memuat…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Belum ada permintaan.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(r.requested_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.requested_by_name ?? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          Sistem
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium">
                        {r.from_location_name ?? "—"}
                      </span>
                      {" → "}
                      <span className="font-medium">
                        {r.to_location_name ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {(r.items ?? []).length} SKU ·{" "}
                      {(r.items ?? []).reduce((a, i) => a + i.qty, 0)} qty
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.assignee_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={STATUS_BADGE[r.status]}>
                          {r.status}
                        </Badge>
                        {r.transfer_out_number && (
                          <Link
                            href={`/dashboard/barang-keluar?transfer=${r.transfer_out_id}`}
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                            title={`Transfer Keluar ${r.transfer_out_number} · ${r.transfer_out_status}`}
                          >
                            <ExternalLinkIcon className="size-3" />
                            {r.transfer_out_number}
                          </Link>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          asChild
                          size="icon"
                          variant="ghost"
                          title="Lihat detail"
                        >
                          <Link href={`/dashboard/permintaan-restock/${r.id}`}>
                            <EyeIcon className="size-4" />
                          </Link>
                        </Button>
                        {r.status === "PENDING" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Terima"
                              onClick={() => setAcceptTarget(r)}
                            >
                              <CheckIcon className="size-4 text-emerald-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Tolak"
                              onClick={() => setRejectTarget(r)}
                            >
                              <XIcon className="size-4 text-rose-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </LiquidGlass>

      <AcceptReplenishmentDialog
        open={!!acceptTarget}
        onOpenChange={(v) => (!v ? setAcceptTarget(null) : null)}
        request={acceptTarget}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(v) => (!v ? setRejectTarget(null) : null)}
        title="Tolak permintaan pengisian stok?"
        description="Tim gudang perlu mengirim ulang permintaan bila ditolak."
        confirmLabel="Tolak"
        onConfirm={async () => {
          if (!rejectTarget) return;
          await rejectMut.mutateAsync({ id: rejectTarget.id });
          setRejectTarget(null);
        }}
      />
    </div>
  );
}
