"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRightIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  DashboardQueue,
  DashboardQueueRow,
} from "@/types/dashboard/dashboard";
import { useDashboardQueue } from "@/hooks/dashboard/use-dashboard";

interface ActionQueueTableProps {
  queue: DashboardQueue;
  title: string;
  icon: LucideIcon;
  emptyMessage: string;
  /** Link to the full list page (e.g. Pesanan tab) for "Lihat semua". */
  viewAllHref?: string;
}

const PER_PAGE = 5;

export function ActionQueueTable({
  queue,
  title,
  icon: Icon,
  emptyMessage,
  viewAllHref,
}: ActionQueueTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useDashboardQueue(queue, {
    page,
    per_page: PER_PAGE,
  });

  const items = data?.items ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: PER_PAGE,
    total: 0,
  };

  const columns = useMemo<ColumnDef<DashboardQueueRow>[]>(
    () => [
      {
        accessorKey: "salesorder_no",
        header: "No. Pesanan",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/pesanan/${row.original.id}`}
            className="font-mono text-xs font-medium hover:text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.salesorder_no || "—"}
          </Link>
        ),
      },
      {
        accessorKey: "source",
        header: "Channel",
        cell: ({ row }) =>
          row.original.source ? (
            <Badge variant="secondary" className="capitalize">
              {row.original.source}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "customer_name",
        header: "Pelanggan",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.customer_name || "—"}
          </span>
        ),
      },
      {
        accessorKey: "grand_total",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">
            {formatCurrency(row.original.grand_total)}
          </div>
        ),
      },
      {
        accessorKey: "transaction_date",
        header: "Tanggal",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.transaction_date)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <Card className="gap-4">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4.5 text-muted-foreground" />
          {title}
          {meta.total > 0 ? (
            <Badge variant="secondary" className="ml-1">
              {meta.total}
            </Badge>
          ) : null}
        </CardTitle>
        {viewAllHref ? (
          <CardAction>
            <Button variant="ghost" size="sm" asChild>
              <Link href={viewAllHref}>
                Lihat semua
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          hideToolbar
          manualPagination
          pagination={{ pageIndex: page - 1, pageSize: PER_PAGE }}
          rowCount={meta.total}
          onPaginationChange={(p) => setPage(p.pageIndex + 1)}
          onRowClick={(row) => router.push(`/dashboard/pesanan/${row.id}`)}
          emptyState={
            <EmptyState icon={Icon} title="Tidak ada antrian" description={emptyMessage} />
          }
        />
      </CardContent>
    </Card>
  );
}
