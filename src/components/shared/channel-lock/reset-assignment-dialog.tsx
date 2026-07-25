"use client";

import * as React from "react";
import { Loader2, AlertTriangleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserSelectById,
  type UserSelectByIdOption,
} from "@/components/dashboard/shared/user-select-by-id";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    reason_note: string;
    new_assignee_id?: string;
  }) => Promise<unknown>;
  isSubmitting?: boolean;
  title?: string;
  destructiveDescription: string;
  staff?: UserSelectByIdOption[];
  staffLoading?: boolean;
  currentUserId?: string;
  assigneeLabel?: string;
  assigneeHint?: string;
}

export function ResetAssignmentDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  title = "Reset & Alihkan",
  destructiveDescription,
  staff,
  staffLoading,
  currentUserId,
  assigneeLabel = "Alihkan ke petugas",
  assigneeHint = "Kosongkan kalau mau tugas jadi bebas diklaim mobile worker lain.",
}: Props) {
  const [note, setNote] = React.useState("");
  const [confirmed, setConfirmed] = React.useState(false);
  const [assigneeId, setAssigneeId] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form saat dialog ditutup
      setNote("");
      setConfirmed(false);
      setAssigneeId("");
    }
  }, [open]);

  const canSubmit = confirmed && note.trim().length >= 10 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await onSubmit({
        reason_note: note.trim(),
        new_assignee_id: assigneeId || undefined,
      });
      onOpenChange(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangleIcon className="size-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
            {destructiveDescription}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-note">
              Alasan reset <span className="text-destructive">*</span>{" "}
              <span className="text-xs text-muted-foreground">(min. 10 karakter)</span>
            </Label>
            <Textarea
              id="reset-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Jelaskan kenapa perlu di-reset..."
            />
            <div className="text-xs text-muted-foreground">
              {note.trim().length}/500 karakter
            </div>
          </div>

          {staff !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="reset-assignee">{assigneeLabel}</Label>
              <UserSelectById
                id="reset-assignee"
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

          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(!!v)}
              className="mt-0.5"
            />
            <span className="text-sm">
              Saya paham konsekuensi aksi ini dan tidak bisa dibatalkan.
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Reset & Alihkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
