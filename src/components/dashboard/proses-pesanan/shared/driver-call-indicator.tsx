"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRetryDriverCall } from "@/hooks/proses-pesanan/use-driver-call";

export type DriverCallStatus = "pending" | "success" | "failed" | null | undefined;

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
                "inline-flex items-center gap-1 text-xs font-medium text-emerald-600",
                className,
              )}
              aria-label="Driver Shopee sudah terpanggil"
            >
              <CheckCircle2 className="h-4 w-4" />
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
          "inline-flex items-center gap-1 text-xs font-medium text-amber-600",
          className,
        )}
        aria-label="Sedang memanggil driver Shopee"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Memanggil driver…</span>
      </span>
    );
  }

  // failed
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
              "inline-flex items-center gap-1 rounded text-xs font-medium text-rose-600 hover:underline disabled:opacity-60",
              className,
            )}
            aria-label={message ?? "Panggilan driver Shopee gagal — klik untuk coba lagi"}
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
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
              <div className="mt-1 opacity-80">Percobaan terakhir: {attempted}</div>
            ) : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
