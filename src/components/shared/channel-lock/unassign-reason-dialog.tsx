"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  UserSelectById,
  type UserSelectByIdOption,
} from "@/components/dashboard/shared/user-select-by-id";
import {
  UNASSIGN_REASON_CODES,
  UNASSIGN_REASON_LABELS,
  requiresNote,
  type UnassignReasonCode,
} from "@/constants/unassign-reasons";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    reason_code: UnassignReasonCode;
    reason_note?: string;
    new_assignee_id?: string;
  }) => Promise<unknown>;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
  staff?: UserSelectByIdOption[];
  staffLoading?: boolean;
  currentUserId?: string;
  assigneeLabel?: string;
  assigneeHint?: string;
}

export function UnassignReasonDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  title = "Alihkan Tugas",
  description = "Progress qty/placement dipertahankan. Assignee baru meneruskan dari titik terakhir.",
  staff,
  staffLoading,
  currentUserId,
  assigneeLabel = "Alihkan ke petugas",
  assigneeHint = "Kosongkan kalau mau tugas jadi bebas diklaim mobile worker lain.",
}: Props) {
  const [reason, setReason] = React.useState<UnassignReasonCode | null>(null);
  const [note, setNote] = React.useState("");
  const [assigneeId, setAssigneeId] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form saat dialog ditutup
      setReason(null);
      setNote("");
      setAssigneeId("");
    }
  }, [open]);

  const noteRequired = requiresNote(reason);
  const canSubmit =
    !!reason && !isSubmitting && (!noteRequired || note.trim().length > 0);

  const handleSubmit = async () => {
    if (!reason || !canSubmit) return;
    try {
      await onSubmit({
        reason_code: reason,
        reason_note: note.trim() || undefined,
        new_assignee_id: assigneeId || undefined,
      });
      onOpenChange(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Alasan</Label>
            <RadioGroup
              value={reason ?? ""}
              onValueChange={(v) => setReason(v as UnassignReasonCode)}
              className="grid gap-2"
            >
              {UNASSIGN_REASON_CODES.map((code) => (
                <label
                  key={code}
                  htmlFor={`reason-${code}`}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2 hover:bg-muted/50"
                >
                  <RadioGroupItem value={code} id={`reason-${code}`} />
                  <span className="text-sm">
                    {UNASSIGN_REASON_LABELS[code]}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason-note">
              Catatan{" "}
              {noteRequired ? (
                <span className="text-destructive">*</span>
              ) : (
                "(opsional)"
              )}
            </Label>
            <Textarea
              id="reason-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder={
                noteRequired
                  ? "Jelaskan alasan lainnya..."
                  : "Catatan tambahan (opsional)"
              }
            />
          </div>

          {staff !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="reason-assignee">{assigneeLabel}</Label>
              <UserSelectById
                id="reason-assignee"
                value={assigneeId}
                onChange={(id) => setAssigneeId(id)}
                options={staff}
                isLoading={staffLoading}
                currentUserId={currentUserId}
                placeholder="— Kosongkan untuk lepas tugas —"
                emptyText="Tidak ada petugas di lokasi ini."
              />
              <p className="text-xs text-muted-foreground">{assigneeHint}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Alihkan Tugas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
