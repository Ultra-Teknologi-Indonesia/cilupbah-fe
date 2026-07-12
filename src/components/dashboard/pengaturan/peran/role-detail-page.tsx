"use client";

import * as React from "react";
import { PencilIcon, Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { FormSkeleton } from "@/components/ui/page-skeleton";
import { FormFooter } from "@/components/dashboard/shared/form-footer";
import { PermissionMatrix } from "@/components/dashboard/pengaturan/permission-matrix";
import { RoleFormDialog } from "@/components/dashboard/pengaturan/peran/role-form-dialog";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { usePermissionCatalog } from "@/hooks/pengaturan/use-permission-catalog";
import {
  useRoleDetail,
  useSyncRolePermissions,
} from "@/hooks/pengaturan/use-roles";
import { apiError } from "@/lib/toast";

function titleCase(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((x) => set.has(x));
}

interface RoleDetailPageProps {
  id: string;
}

export function RoleDetailPage({ id }: RoleDetailPageProps) {
  const { can } = usePermissions();
  const { data: role, isLoading } = useRoleDetail(id);
  const { data: catalog, isLoading: catalogLoading } = usePermissionCatalog();
  const syncPermissions = useSyncRolePermissions();

  const [selected, setSelected] = React.useState<string[]>([]);
  const [editOpen, setEditOpen] = React.useState(false);

  const isOwner = role?.name === "owner";
  const canEdit = can("edit-role") && !isOwner;

  React.useEffect(() => {
    if (role?.permissions) setSelected(role.permissions);
  }, [role?.permissions]);

  if (isLoading || catalogLoading) return <FormSkeleton />;
  if (!role || !catalog) {
    return (
      <div className="py-16 text-center text-sm text-destructive">
        Peran tidak ditemukan.
      </div>
    );
  }

  const dirty = !sameSet(selected, role.permissions ?? []);

  function handleSave() {
    syncPermissions.mutate(
      { id, permissions: selected },
      {
        onSuccess: () => toast.success("Hak akses peran berhasil disimpan."),
        onError: (err) => apiError(err, "Gagal menyimpan hak akses."),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-start justify-between gap-3 p-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">{titleCase(role.name)}</h2>
              {isOwner && (
                <Badge variant="secondary" className="font-normal">
                  Bawaan
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {role.description || "Tanpa deskripsi."}
            </p>
          </div>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <PencilIcon className="mr-1 size-4" />
              Ubah Info
            </Button>
          )}
        </div>
      </LiquidGlass>

      {isOwner && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          Peran <span className="font-medium text-foreground">Owner</span>{" "}
          memiliki akses penuh ke seluruh sistem dan tidak dapat diubah.
        </div>
      )}

      <PermissionMatrix
        catalog={catalog}
        value={selected}
        onChange={setSelected}
        disabled={!canEdit}
      />

      {canEdit && (
        <FormFooter>
          <Button
            variant="outline"
            onClick={() => setSelected(role.permissions ?? [])}
            disabled={!dirty || syncPermissions.isPending}
          >
            Batalkan Perubahan
          </Button>
          <Button onClick={handleSave} disabled={!dirty || syncPermissions.isPending}>
            {syncPermissions.isPending && (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            )}
            Simpan Hak Akses
          </Button>
        </FormFooter>
      )}

      <RoleFormDialog open={editOpen} onOpenChange={setEditOpen} role={role} />
    </div>
  );
}
