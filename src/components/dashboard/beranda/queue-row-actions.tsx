"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  CheckIcon,
  ExternalLinkIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  TruckIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAcceptCancelRequest,
  useMoveToReady,
  useRejectCancelRequest,
  useRequestAwb,
} from "@/hooks/pesanan/use-order-actions";
import type {
  DashboardQueue,
  DashboardQueueRow,
} from "@/types/dashboard/dashboard";

interface QueueRowActionsProps {
  queue: DashboardQueue;
  row: DashboardQueueRow;
}

export function QueueRowActions({ queue, row }: QueueRowActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const moveToReady = useMoveToReady();
  const requestAwb = useRequestAwb();
  const acceptCancel = useAcceptCancelRequest();
  const rejectCancel = useRejectCancelRequest();

  const [confirm, setConfirm] = useState<"accept" | "reject" | null>(null);

  const refreshDashboard = () =>
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  const withRefresh = { onSuccess: refreshDashboard };

  const openDetail = () => router.push(`/dashboard/pesanan/${row.id}`);

  const busy =
    moveToReady.isPending ||
    requestAwb.isPending ||
    acceptCancel.isPending ||
    rejectCancel.isPending;

  const detailItem = (
    <DropdownMenuItem onSelect={openDetail}>
      <ExternalLinkIcon />
      Buka detail
    </DropdownMenuItem>
  );

  if (queue === "ready-to-process") {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => moveToReady.mutate([row.id], withRefresh)}
        >
          {moveToReady.isPending ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <ArrowRightIcon className="size-3.5" />
          )}
          Proses
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={busy}
              aria-label="Aksi lain"
            >
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() =>
                requestAwb.mutate({ orderId: row.id }, withRefresh)
              }
            >
              <TruckIcon />
              Atur pengiriman
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {detailItem}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (queue === "pending-cancel") {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs text-success hover:text-success"
          disabled={busy}
          onClick={() => setConfirm("accept")}
        >
          <CheckIcon className="size-3.5" />
          Terima
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
          disabled={busy}
          onClick={() => setConfirm("reject")}
        >
          <XIcon className="size-3.5" />
          Tolak
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={busy}
              aria-label="Aksi lain"
            >
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">{detailItem}</DropdownMenuContent>
        </DropdownMenu>

        <ConfirmDialog
          open={confirm === "accept"}
          onOpenChange={(open) => !open && setConfirm(null)}
          title="Terima permintaan pembatalan?"
          description={`Pesanan ${row.salesorder_no ?? ""} akan dibatalkan dan stok dikembalikan.`}
          confirmLabel="Terima pembatalan"
          loading={acceptCancel.isPending}
          onConfirm={() =>
            acceptCancel.mutate(row.id, {
              onSuccess: () => {
                refreshDashboard();
                setConfirm(null);
              },
            })
          }
        />
        <ConfirmDialog
          open={confirm === "reject"}
          onOpenChange={(open) => !open && setConfirm(null)}
          title="Tolak permintaan pembatalan?"
          description={`Pesanan ${row.salesorder_no ?? ""} tetap diproses seperti biasa.`}
          confirmLabel="Tolak pembatalan"
          variant="destructive"
          loading={rejectCancel.isPending}
          onConfirm={() =>
            rejectCancel.mutate(row.id, {
              onSuccess: () => {
                refreshDashboard();
                setConfirm(null);
              },
            })
          }
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="Aksi lain">
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">{detailItem}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
