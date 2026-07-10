"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PermissionGroup } from "@/types/pengaturan/permission";

/** Urutan & label kolom aksi tetap (mengikuti gaya Jubelio). */
const ACTION_COLUMNS = [
  { action: "view", label: "Lihat" },
  { action: "create", label: "Tambah" },
  { action: "edit", label: "Ubah" },
  { action: "delete", label: "Hapus" },
  { action: "export", label: "Ekspor" },
  { action: "import", label: "Impor" },
] as const;

interface PermissionMatrixProps {
  catalog: PermissionGroup[];
  /** Permission terpilih yang bisa diedit (controlled). */
  value: string[];
  onChange: (next: string[]) => void;
  /**
   * Permission bawaan (mis. dari peran) — tampil tercentang & terkunci,
   * tidak ikut `value`. Dipakai di tab Hak Akses pengguna.
   */
  baseline?: string[];
  /** Read-only penuh (mis. role owner). */
  disabled?: boolean;
}

export function PermissionMatrix({
  catalog,
  value,
  onChange,
  baseline,
  disabled = false,
}: PermissionMatrixProps) {
  const valueSet = React.useMemo(() => new Set(value), [value]);
  const baseSet = React.useMemo(() => new Set(baseline ?? []), [baseline]);

  const [openGroups, setOpenGroups] = React.useState<Set<string>>(
    () => new Set(catalog.map((g) => g.key)),
  );

  const isChecked = (perm: string) => valueSet.has(perm) || baseSet.has(perm);
  const isLocked = (perm: string) => disabled || baseSet.has(perm);

  const toggleMany = (perms: string[], on: boolean) => {
    const next = new Set(value);
    for (const p of perms) {
      if (isLocked(p)) continue;
      if (on) next.add(p);
      else next.delete(p);
    }
    onChange([...next]);
  };

  const toggleOne = (perm: string) => {
    if (isLocked(perm)) return;
    toggleMany([perm], !valueSet.has(perm));
  };

  const resourcePerms = (r: PermissionGroup["resources"][number]) => [
    ...r.actions.map((a) => a.permission),
    ...r.extras.map((e) => e.permission),
  ];

  const groupPerms = (g: PermissionGroup) => g.resources.flatMap(resourcePerms);

  const allChecked = (perms: string[]) =>
    perms.length > 0 && perms.every(isChecked);

  const countChecked = (perms: string[]) =>
    perms.filter((p) => isChecked(p)).length;

  return (
    <div className="flex flex-col gap-3">
      {catalog.map((group) => {
        const gPerms = groupPerms(group);
        const gAll = allChecked(gPerms);
        const isOpen = openGroups.has(group.key);

        return (
          <Collapsible
            key={group.key}
            open={isOpen}
            onOpenChange={(open) =>
              setOpenGroups((prev) => {
                const next = new Set(prev);
                if (open) next.add(group.key);
                else next.delete(group.key);
                return next;
              })
            }
            className="overflow-hidden rounded-xl border bg-card"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Checkbox
                checked={gAll}
                disabled={disabled}
                onCheckedChange={() => toggleMany(gPerms, !gAll)}
                aria-label={`Pilih semua ${group.label}`}
              />
              <CollapsibleTrigger className="group flex flex-1 items-center justify-between gap-2 text-left">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {group.label}
                  <Badge variant="secondary" className="font-normal">
                    {countChecked(gPerms)}/{gPerms.length}
                  </Badge>
                </span>
                <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              <div className="overflow-x-auto border-t">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="min-w-[220px]">Menu / Fitur</TableHead>
                      {ACTION_COLUMNS.map((c) => (
                        <TableHead
                          key={c.action}
                          className="w-20 text-center text-xs font-medium"
                        >
                          {c.label}
                        </TableHead>
                      ))}
                      <TableHead className="w-16 text-center text-xs font-medium">
                        Semua
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.resources.map((resource) => {
                      const actionByKey = new Map(
                        resource.actions.map((a) => [a.action, a.permission]),
                      );
                      const rPerms = resourcePerms(resource);
                      const rAll = allChecked(rPerms);

                      return (
                        <TableRow key={resource.key} className="align-top">
                          <TableCell className="py-2.5">
                            <div className="text-sm font-medium">
                              {resource.label}
                            </div>
                            {resource.extras.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
                                {resource.extras.map((extra) => (
                                  <label
                                    key={extra.permission}
                                    className={cn(
                                      "flex items-center gap-1.5 text-xs text-muted-foreground",
                                      isLocked(extra.permission)
                                        ? "cursor-default"
                                        : "cursor-pointer",
                                    )}
                                  >
                                    <Checkbox
                                      checked={isChecked(extra.permission)}
                                      disabled={isLocked(extra.permission)}
                                      onCheckedChange={() =>
                                        toggleOne(extra.permission)
                                      }
                                    />
                                    {extra.label}
                                  </label>
                                ))}
                              </div>
                            )}
                          </TableCell>

                          {ACTION_COLUMNS.map((col) => {
                            const perm = actionByKey.get(col.action);
                            return (
                              <TableCell key={col.action} className="text-center">
                                {perm ? (
                                  <Checkbox
                                    checked={isChecked(perm)}
                                    disabled={isLocked(perm)}
                                    onCheckedChange={() => toggleOne(perm)}
                                    aria-label={`${col.label} ${resource.label}`}
                                    className="mx-auto"
                                  />
                                ) : (
                                  <span className="text-muted-foreground/30">
                                    –
                                  </span>
                                )}
                              </TableCell>
                            );
                          })}

                          <TableCell className="text-center">
                            <Checkbox
                              checked={rAll}
                              disabled={disabled}
                              onCheckedChange={() => toggleMany(rPerms, !rAll)}
                              aria-label={`Pilih semua ${resource.label}`}
                              className="mx-auto"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
