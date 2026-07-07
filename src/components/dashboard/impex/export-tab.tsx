"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpFromLineIcon, DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { useImpexActivities } from "@/hooks/impex/use-impex-activities";
import { formatDateTime } from "@/lib/format";
import type { ImpexActivity } from "@/types/impex";

export function ExportTab() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [myOnly, setMyOnly] = useState(false);

  const { data, isLoading } = useImpexActivities("export", {
    page,
    perPage,
    myOnly,
  });

  const items = data?.items ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  };

  const columns = useMemo<ColumnDef<ImpexActivity>[]>(
    () => [
      {
        accessorKey: "activityType",
        header: "Jenis Export",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.activityType}
          </span>
        ),
      },
      {
        accessorKey: "startedAt",
        header: "Tgl. Permintaan",
        cell: ({ row }) => formatDateTime(row.original.startedAt),
      },
      {
        accessorKey: "completedAt",
        header: "Tgl. Selesai",
        cell: ({ row }) => formatDateTime(row.original.completedAt),
      },
      {
        accessorKey: "performedBy",
        header: "User",
        cell: ({ row }) => row.original.performedBy ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge domain="impex-activity" status={row.original.status} />
        ),
      },
      {
        id: "download",
        header: "",
        cell: ({ row }) => {
          const fileUrl = row.original.fileUrl;
          const canDownload = !!fileUrl && row.original.status === "success";
          return (
            <Button
              variant={canDownload ? "default" : "outline"}
              size="sm"
              disabled={!canDownload}
              onClick={(e) => {
                e.stopPropagation();
                if (fileUrl) window.open(fileUrl, "_blank");
              }}
              className={canDownload ? "bg-success hover:bg-success/90" : ""}
            >
              <DownloadIcon className="mr-1.5 size-4" />
              Download
            </Button>
          );
        },
      },
    ],
    [],
  );

  return (
    <LiquidGlass
      radius={20}
      intensity="subtle"
      className="bg-white/30 dark:bg-white/[0.04]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={myOnly}
            onCheckedChange={(checked) => {
              setMyOnly(checked === true);
              setPage(1);
            }}
          />
          Tampilkan hanya akun email saya
        </label>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Total{" "}
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {meta.total}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6">
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          hideToolbar
          manualPagination
          pagination={{
            pageIndex: page - 1,
            pageSize: perPage,
          }}
          rowCount={meta.total}
          onPaginationChange={(p) => {
            setPage(p.pageIndex + 1);
            setPerPage(p.pageSize);
          }}
          tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
          emptyState={
            <EmptyState
              icon={ArrowUpFromLineIcon}
              title="Belum ada aktivitas export"
              description="Riwayat export akan tampil di sini."
            />
          }
        />
      </div>
    </LiquidGlass>
  );
}
