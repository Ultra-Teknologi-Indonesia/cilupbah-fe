"use client";

import { Loader2Icon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useImpexActivityDetails } from "@/hooks/impex/use-impex-activities";

interface KeteranganDialogProps {
  activityId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function KeteranganDialog({
  activityId,
  onOpenChange,
}: KeteranganDialogProps) {
  const open = !!activityId;
  const { data, isLoading } = useImpexActivityDetails(
    "import",
    activityId ?? "",
    open,
  );

  const items = data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Keterangan Import</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          Total{" "}
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {items.length}
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto rounded-xl border">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2Icon className="size-5 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Belum ada keterangan"
              description="Tidak ada detail item untuk aktivitas ini."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-foreground">
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`} className="border-b last:border-0">
                    <td className="px-4 py-2 text-foreground">{item.id}</td>
                    <td className="px-4 py-2 text-foreground">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
