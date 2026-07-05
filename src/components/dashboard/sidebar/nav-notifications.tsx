"use client";

import Link from "next/link";
import { BellIcon, PackageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  usePendingReplenishmentCount,
  useStockReplenishments,
} from "@/hooks/gudang/use-stock-replenishment";

export function NotificationsPopover() {
  const { data: pendingCount = 0 } = usePendingReplenishmentCount();
  const { data: pendingList } = useStockReplenishments({
    status: "PENDING",
    per_page: 5,
  });

  const items = pendingList?.items ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label="Buka notifikasi"
        >
          <BellIcon className="size-5" />
          {pendingCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-2xs font-semibold text-destructive-foreground shadow-sm">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="my-6 w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifikasi</span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-2xs font-medium text-destructive">
              {pendingCount} permintaan
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            Belum ada permintaan pengisian stok.
          </div>
        ) : (
          items.map((req) => {
            const totalQty = (req.items ?? []).reduce(
              (acc, i) => acc + i.qty,
              0,
            );
            return (
              <DropdownMenuItem key={req.id} asChild>
                <Link
                  href="/dashboard/permintaan-restock"
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <PackageIcon className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      Pengisian stok {req.to_location_name ?? "Gudang Kecil"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {(req.items ?? []).length} SKU · {totalQty} qty ·{" "}
                      {req.requested_by_name ?? "tim gudang"}
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <Link
            href="/dashboard/permintaan-restock"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Lihat semua permintaan
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
