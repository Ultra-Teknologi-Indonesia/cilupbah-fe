"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  useCreateMultiSkuRule,
  useDeleteMultiSkuRule,
  useMultiSkuPatternSuggestions,
  useMultiSkuRules,
  useUpdateMultiSkuRule,
} from "@/hooks/manajemen-rak/use-multi-sku-rules";
import { cn } from "@/lib/utils";
import type { BinMultiSkuRule } from "@/types/manajemen-rak/location";

function RuleFormDialog({
  open,
  onOpenChange,
  locationId,
  rule,
  usedPatterns,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId?: string;
  rule: BinMultiSkuRule | null;
  usedPatterns: string[];
}) {
  const [pattern, setPattern] = React.useState(rule?.pattern ?? "");
  const [note, setNote] = React.useState(rule?.note ?? "");

  const createMut = useCreateMultiSkuRule(locationId);
  const updateMut = useUpdateMultiSkuRule(locationId);
  const pending = createMut.isPending || updateMut.isPending;

  const { data: suggestions = [], isLoading: loadingSuggestions } =
    useMultiSkuPatternSuggestions(locationId, open);

  const available = React.useMemo(
    () =>
      suggestions.filter(
        (s) => s.pattern === rule?.pattern || !usedPatterns.includes(s.pattern),
      ),
    [suggestions, usedPatterns, rule?.pattern],
  );

  const options: ComboboxOption[] = React.useMemo(
    () =>
      available.map((s) => ({
        value: s.pattern,
        label: s.pattern,
        hint: `${s.matchedCount} rak`,
      })),
    [available],
  );

  const selected = available.find((s) => s.pattern === pattern) ?? null;

  const handleSave = async () => {
    const trimmed = pattern.trim();
    if (!trimmed) return;

    const payload = { pattern: trimmed, note: note.trim() || null };

    try {
      if (rule) {
        await updateMut.mutateAsync({ ruleId: rule.id, payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{rule ? "Ubah Pola" : "Tambah Pola"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="multi-sku-pattern">
              Pola Kode Rak
              <span className="text-destructive"> *</span>
            </Label>
            <Combobox
              id="multi-sku-pattern"
              options={options}
              value={pattern || null}
              onChange={(v) => setPattern(v ?? "")}
              placeholder="Pilih kelompok rak"
              searchPlaceholder="Cari pola, mis. GK atau O-LX"
              emptyText={
                loadingSuggestions ? "Memuat…" : "Tidak ada pola yang cocok."
              }
              loading={loadingSuggestions}
            />

            {!loadingSuggestions && options.length === 0 && (
              <p className="flex items-start gap-1.5 text-xs text-warning">
                <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                Tidak ada kelompok rak yang tersisa. Semua sudah punya aturan,
                atau lokasi ini belum punya rak.
              </p>
            )}

            {selected && (
              <p className="truncate font-mono text-2xs text-muted-foreground">
                {selected.samples.join(", ")}
                {selected.matchedCount > selected.samples.length ? ", …" : ""}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="multi-sku-note">Catatan</Label>
            <Input
              id="multi-sku-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Slow moving"
              maxLength={255}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={pending || !pattern.trim()}
          >
            {pending && <Loader2Icon className="mr-2 size-3.5 animate-spin" />}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MultiSkuRulesCard({
  locationId,
  disabled,
}: {
  locationId?: string;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BinMultiSkuRule | null>(null);
  const [formKey, setFormKey] = React.useState(0);
  const [pendingDelete, setPendingDelete] =
    React.useState<BinMultiSkuRule | null>(null);

  const { data: rules = [], isLoading } = useMultiSkuRules(locationId);
  const deleteMut = useDeleteMultiSkuRule(locationId);

  const totalMatched = rules.reduce((sum, r) => sum + r.matchedCount, 0);

  const openCreate = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const openEdit = (rule: BinMultiSkuRule) => {
    setEditing(rule);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMut.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
    } catch {}
  };

  return (
    <div className="rounded-4xl border border-border bg-background">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Rak Multi-SKU</p>
          <p className="truncate text-xs text-muted-foreground">
            {isLoading
              ? "Memuat…"
              : rules.length === 0
                ? "Belum ada pola. Semua rak dibatasi satu SKU."
                : `${rules.length} pola · ${totalMatched} rak`}
          </p>
        </div>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-border px-5 py-4">
          <p className="text-xs text-muted-foreground">
            Rak yang cocok dengan pola di bawah boleh diisi lebih dari satu SKU.
            Satu SKU tetap hanya boleh menempati satu rak.
          </p>

          {rules.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="px-3 py-2.5 font-medium text-muted-foreground">
                      Pola Kode Rak
                    </TableHead>
                    <TableHead className="px-3 py-2.5 font-medium text-muted-foreground">
                      Catatan
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                      Rak Cocok
                    </TableHead>
                    <TableHead className="w-20 px-3 py-2.5" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="px-3 py-2.5 font-mono text-sm">
                        {rule.pattern}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-sm text-muted-foreground">
                        {rule.note || "—"}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-sm font-medium tabular-nums">
                        {rule.matchedCount}
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Ubah pola"
                            onClick={() => openEdit(rule)}
                            disabled={disabled}
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Hapus pola"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setPendingDelete(rule)}
                            disabled={disabled}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={openCreate}
              disabled={disabled}
            >
              <PlusIcon className="size-4" />
              Tambah Pola
            </Button>
          </div>
        </div>
      )}

      <RuleFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        locationId={locationId}
        rule={editing}
        usedPatterns={rules.map((r) => r.pattern)}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Hapus pola ini?"
        description={
          pendingDelete
            ? `${pendingDelete.matchedCount} rak yang cocok dengan "${pendingDelete.pattern}" akan kembali dibatasi satu SKU. Stok yang sudah ada di rak tersebut tidak berubah, tapi penempatan SKU baru ke rak itu akan ditolak.`
            : undefined
        }
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function MultiSkuBadge({ pattern }: { pattern?: string }) {
  return (
    <Badge
      variant="outline"
      className="shrink-0 gap-1 px-2 py-0.5 text-2xs"
      title={
        pattern
          ? `Rak ini cocok dengan pola ${pattern}.`
          : "Rak ini boleh diisi lebih dari satu SKU."
      }
    >
      Multi-SKU
    </Badge>
  );
}
