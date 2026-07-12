"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRole, useUpdateRole } from "@/hooks/pengaturan/use-roles";
import type { Role } from "@/types/pengaturan/user";
import { apiError } from "@/lib/toast";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Kalau diisi → mode edit metadata; kosong → buat peran baru. */
  role?: Role | null;
  onCreated?: (role: Role) => void;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onCreated,
}: RoleFormDialogProps) {
  const isEdit = !!role;
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const isPending = createRole.isPending || updateRole.isPending;

  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevRole, setPrevRole] = React.useState(role);
  if (open !== prevOpen || role !== prevRole) {
    setPrevOpen(open);
    setPrevRole(role);
    if (open) {
      setName(role?.name ?? "");
      setDescription(role?.description ?? "");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Nama peran wajib diisi.");
      return;
    }
    const payload = { name: trimmed, description: description.trim() || null };

    if (isEdit && role) {
      updateRole.mutate(
        { id: role.id, payload },
        {
          onSuccess: () => {
            toast.success("Peran berhasil diperbarui.");
            onOpenChange(false);
          },
          onError: (err) => apiError(err, "Gagal memperbarui peran."),
        },
      );
    } else {
      createRole.mutate(payload, {
        onSuccess: (created) => {
          toast.success("Peran berhasil dibuat.");
          onOpenChange(false);
          onCreated?.(created);
        },
        onError: (err) => apiError(err, "Gagal membuat peran."),
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!isPending) onOpenChange(o);
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Ubah Peran" : "Tambah Peran"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Perbarui nama dan deskripsi peran. Hak akses diatur di halaman detail peran."
                : "Buat peran baru, lalu tetapkan hak aksesnya di halaman detail."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="role-name">
              Nama Peran <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. supervisor gudang"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-desc">Deskripsi</Label>
            <Textarea
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tanggung jawab utama peran ini…"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
