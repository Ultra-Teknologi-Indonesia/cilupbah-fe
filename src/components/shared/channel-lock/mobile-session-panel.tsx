"use client";

import * as React from "react";
import {
  LockIcon,
  CheckCircle2Icon,
  UserMinus2Icon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { cn } from "@/lib/utils";
import type {
  InboundParticipant,
  InboundEditLock,
} from "@/types/barang-masuk/inbound";

interface MobileSessionPanelProps {
  participants: InboundParticipant[];
  editLock?: InboundEditLock;
  receivingStartedAt?: string | null;
  canWithdraw?: boolean;
  onWithdraw?: (userId: string, name: string) => void;
}

export function MobileSessionPanel({
  participants,
  editLock,
  receivingStartedAt,
  canWithdraw,
  onWithdraw,
}: MobileSessionPanelProps) {
  const [confirmTarget, setConfirmTarget] = React.useState<{
    userId: string;
    name: string;
  } | null>(null);

  if (!participants || participants.length === 0) return null;

  const active = participants.filter(
    (p) => p.status === "ACTIVE" && p.user_id !== null,
  );
  const done = participants.filter((p) => p.status === "DONE");
  const withdrawn = participants.filter((p) => p.status === "WITHDRAWN");
  const locked = editLock?.locked ?? active.length > 0;

  const totalReceived = participants.reduce(
    (sum, p) => sum + (p.receipts_qty_sum ?? 0),
    0,
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-4 py-3 text-sm",
        locked
          ? "border-warning/40 bg-warning/10"
          : "border-border bg-muted/40",
      )}
    >
      <div className="flex items-start gap-3">
        {locked ? (
          <LockIcon className="mt-0.5 size-4 shrink-0 text-warning" />
        ) : (
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" />
        )}
        <div className="flex-1 space-y-0.5">
          <div className="font-medium text-foreground">
            {locked
              ? `Sesi penerimaan aktif — ${active.length} staff sedang input`
              : "Semua staff selesai — anda boleh koreksi angka"}
          </div>
          <div className="text-xs text-muted-foreground">
            Total diterima {formatQty(totalReceived)} unit dari{" "}
            {participants.length} peserta
            {receivingStartedAt
              ? ` · mulai ${formatWhen(receivingStartedAt)}`
              : ""}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {active.map((p) => (
          <ParticipantRow
            key={p.id}
            participant={p}
            canWithdraw={canWithdraw}
            onWithdraw={() => {
              if (p.user_id) {
                setConfirmTarget({ userId: p.user_id, name: p.name });
              }
            }}
          />
        ))}
        {done.map((p) => (
          <ParticipantRow key={p.id} participant={p} />
        ))}
        {withdrawn.map((p) => (
          <ParticipantRow key={p.id} participant={p} />
        ))}
      </div>

      <ConfirmDialog
        open={confirmTarget != null}
        onOpenChange={(o) => !o && setConfirmTarget(null)}
        title="Tarik peserta dari sesi?"
        description={
          confirmTarget
            ? `${confirmTarget.name} akan ditandai keluar. Receipts miliknya tetap tercatat.`
            : ""
        }
        confirmLabel="Tarik"
        variant="destructive"
        onConfirm={() => {
          if (confirmTarget)
            onWithdraw?.(confirmTarget.userId, confirmTarget.name);
          setConfirmTarget(null);
        }}
      />
    </div>
  );
}

function ParticipantRow({
  participant,
  canWithdraw,
  onWithdraw,
}: {
  participant: InboundParticipant;
  canWithdraw?: boolean;
  onWithdraw?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/60 px-3 py-2">
      <UsersIcon className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium">{participant.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          {formatQty(participant.receipts_qty_sum)} unit ·{" "}
          {participant.receipts_count} scan
          {participant.joined_at
            ? ` · gabung ${formatWhen(participant.joined_at)}`
            : ""}
        </div>
      </div>
      <StatusBadge domain="inbound-participant" status={participant.status} />
      {participant.status === "ACTIVE" && canWithdraw && onWithdraw && (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={onWithdraw}
        >
          <UserMinus2Icon className="mr-1.5 size-4" />
          Tarik
        </Button>
      )}
    </div>
  );
}

function formatQty(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n ?? 0);
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
