"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRightIcon,
  FileXIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  ShieldIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Can } from "@/components/auth/can";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useDeleteRole, useRoleList } from "@/hooks/pengaturan/use-roles";
import type { Role } from "@/types/pengaturan/user";
import { RoleFormDialog } from "./role-form-dialog";

function titleCase(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg) return msg;
  }
  return fallback;
}

export function RoleListView() {
  const router = useRouter();
  const { can } = usePermissions();
  const { data: roles, isLoading, isError } = useRoleList();
  const deleteRole = useDeleteRole();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Role | null>(null);

  const canEdit = can("edit-role");
  const canDelete = can("delete-role");

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteRole.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Peran berhasil dihapus.");
        setDeleteTarget(null);
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, "Gagal menghapus peran.")),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
          <p className="text-sm text-muted-foreground">
            Kelola peran dan hak akses yang bisa diberikan ke pengguna.
          </p>
          <Can permission="create-role">
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <PlusIcon className="mr-1 size-4" />
              Tambah Peran
            </Button>
          </Can>
        </div>

        <div className="px-5 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-sm text-destructive">
              Gagal memuat data peran.
            </div>
          ) : !roles || roles.length === 0 ? (
            <EmptyState icon={FileXIcon} title="Belum ada peran" />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-[180px]">Peran</TableHead>
                    <TableHead className="min-w-[240px]">Deskripsi</TableHead>
                    <TableHead className="w-32 text-center">Pengguna</TableHead>
                    <TableHead className="w-28 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => {
                    const isOwner = role.name === "owner";
                    return (
                      <TableRow key={role.id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/pengaturan/peran/${role.id}`}
                            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                          >
                            <ShieldIcon className="size-4 text-muted-foreground" />
                            {titleCase(role.name)}
                          </Link>
                          {isOwner && (
                            <Badge variant="secondary" className="ml-2 font-normal">
                              Bawaan
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {role.description || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-normal">
                            {role.usersCount ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {canEdit && !isOwner && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setEditTarget(role)}
                                aria-label={`Ubah ${role.name}`}
                              >
                                <PencilIcon className="size-4" />
                              </Button>
                            )}
                            {canDelete && !isOwner && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(role)}
                                aria-label={`Hapus ${role.name}`}
                              >
                                <Trash2Icon className="size-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground"
                              onClick={() =>
                                router.push(
                                  `/dashboard/pengaturan/peran/${role.id}`,
                                )
                              }
                              aria-label={`Buka ${role.name}`}
                            >
                              <ChevronRightIcon className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </LiquidGlass>

      <RoleFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(role) =>
          router.push(`/dashboard/pengaturan/peran/${role.id}`)
        }
      />
      <RoleFormDialog
        open={Boolean(editTarget)}
        onOpenChange={(o) => !o && setEditTarget(null)}
        role={editTarget}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteRole.isPending) setDeleteTarget(null);
        }}
        title="Hapus Peran"
        description={`Hapus peran ${deleteTarget ? titleCase(deleteTarget.name) : ""}? Peran yang masih dipakai pengguna tidak dapat dihapus.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteRole.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
