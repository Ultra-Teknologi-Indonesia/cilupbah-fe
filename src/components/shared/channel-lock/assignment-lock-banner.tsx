"use client";

import * as React from "react";
import { LockIcon, CheckCircle2Icon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AssignmentLockBannerProps {
  assignedToName: string | null;
  assignedAt: string | null;
  isUnlockedOnce: boolean;
  status: string;
  onUnassign?: () => void;
  onReset?: () => void;
  canUnassign?: boolean;
  canReset?: boolean;

  mode?: "lock" | "collaborative" | "advisory";
}

export function AssignmentLockBanner({
  assignedToName,
  assignedAt,
  isUnlockedOnce,
  status,
  onUnassign,
  onReset,
  canUnassign,
  canReset,
  mode = "lock",
}: AssignmentLockBannerProps) {
  if (status === "CANCELLED") return null;

  if (isUnlockedOnce && assignedToName) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
        <CheckCircle2Icon className="size-4 shrink-0 text-success" />
        <span className="text-muted-foreground">
          Sudah selesai oleh <span className="font-medium text-foreground">{assignedToName}</span>.
          Kamu bisa mengoreksi qty dari sini.
        </span>
      </div>
    );
  }

  if (!assignedToName) return null;

  const isCollaborative = mode === "collaborative";
  const isAdvisory = mode === "advisory";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-4 py-3 text-sm",
        "sm:flex-row sm:items-center sm:justify-between",
        isCollaborative
          ? "border-border bg-muted/40"
          : "border-warning/40 bg-warning/10",
      )}
    >
      <div className="flex items-start gap-3">
        {isCollaborative ? (
          <UsersIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        ) : isAdvisory ? (
          <UsersIcon className="mt-0.5 size-4 shrink-0 text-warning" />
        ) : (
          <LockIcon className="mt-0.5 size-4 shrink-0 text-warning" />
        )}
        <div className="space-y-0.5">
          <div className="font-medium text-foreground">
            {isCollaborative
              ? `Ditugaskan ke ${assignedToName}`
              : `Dikerjakan oleh ${assignedToName} di Mobile`}
          </div>
          <div className="text-xs text-muted-foreground">
            {isCollaborative
              ? "Boleh dikerjakan bersama — progres tiap scan langsung terlihat di semua perangkat."
              : isAdvisory
                ? "Kamu tetap bisa mengedit dari web. Koordinasikan dulu dengan staff supaya angka tidak bentrok."
                : "Kolom edit dinonaktifkan sampai tim menandai selesai."}
            {assignedAt ? ` Ditugaskan ${formatWhen(assignedAt)}.` : ""}
          </div>
        </div>
      </div>
      {(canUnassign || canReset) && (
        <div className="flex gap-2 sm:shrink-0">
          {canUnassign && onUnassign && (
            <Button size="sm" variant="outline" onClick={onUnassign}>
              Alihkan Tugas
            </Button>
          )}
          {canReset && onReset && (
            <Button size="sm" variant="destructive" onClick={onReset}>
              Reset & Alihkan
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
