"use client";

import { CheckCircle2, Loader2, Phone, Truck, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRetryDriverCall } from "@/hooks/proses-pesanan/use-driver-call";
import type { DriverCallStatus as ShipmentDriverCallStatus } from "@/types/proses-pesanan/fulfillment";

export type DriverCallStatus =
  "pending" | "success" | "failed" | null | undefined;

interface DriverCallIndicatorProps {
  orderId: string;
  status: DriverCallStatus;
  message?: string | null;
  attemptedAt?: string | null;
  className?: string;
}

export function DriverCallIndicator({
  orderId,
  status,
  message,
  attemptedAt,
  className,
}: DriverCallIndicatorProps) {
  const retry = useRetryDriverCall();

  if (!status) return null;

  const attempted = attemptedAt
    ? new Date(attemptedAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  if (status === "success") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium text-success",
                className,
              )}
              aria-label="Driver Shopee sudah terpanggil"
            >
              <CheckCircle2 className="size-4" />
              <span>Driver terpanggil</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Driver Shopee sudah terpanggil{attempted ? ` · ${attempted}` : ""}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (status === "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium text-warning",
          className,
        )}
        aria-label="Sedang memanggil driver Shopee"
      >
        <Loader2 className="size-4 animate-spin" />
        <span>Memanggil driver…</span>
      </span>
    );
  }

  const label = retry.isPending ? "Mencoba ulang…" : "Driver gagal";
  const disabled = retry.isPending;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              retry.mutate(orderId);
            }}
            className={cn(
              "inline-flex items-center gap-1 rounded text-xs font-medium text-destructive hover:underline disabled:opacity-60",
              className,
            )}
            aria-label={
              message ?? "Panggilan driver Shopee gagal — klik untuk coba lagi"
            }
          >
            {disabled ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <XCircle className="size-4" />
            )}
            <span>{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="text-xs">
            <div>Klik untuk mencoba panggil driver lagi.</div>
            {message ? (
              <div className="mt-1 text-rose-200">Alasan: {message}</div>
            ) : null}
            {attempted ? (
              <div className="mt-1 opacity-80">
                Percobaan terakhir: {attempted}
              </div>
            ) : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ShipmentDriverBadgeProps {
  status: ShipmentDriverCallStatus | null | undefined;
  driverName?: string | null;
  driverPhone?: string | null;
  calledAt?: string | null;
  className?: string;
}

export function ShipmentDriverBadge({
  status,
  driverName,
  driverPhone,
  calledAt,
  className,
}: ShipmentDriverBadgeProps) {
  if (!status || status === "NONE") return null;

  const attempted = calledAt
    ? new Date(calledAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  if (status === "PICKED_UP") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium text-success",
                className,
              )}
            >
              <Truck className="size-3.5" />
              <span>Sudah pickup</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              {driverName && <div>Driver: {driverName}</div>}
              {driverPhone && <div>HP: {driverPhone}</div>}
              {attempted && (
                <div className="opacity-80">Dipanggil: {attempted}</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (status === "CALLED") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium text-success",
                className,
              )}
            >
              <Phone className="size-3.5" />
              <span className="max-w-[100px] truncate">
                {driverName ?? "Terpanggil"}
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              {driverName && <div>Driver: {driverName}</div>}
              {driverPhone && <div>HP: {driverPhone}</div>}
              {attempted && (
                <div className="opacity-80">Dipanggil: {attempted}</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-destructive",
        className,
      )}
    >
      <XCircle className="size-3.5" />
      <span>Driver gagal</span>
    </span>
  );
}
