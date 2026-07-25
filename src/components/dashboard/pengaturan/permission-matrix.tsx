"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  LockIcon,
  SearchIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import type {
  PermissionGroup,
  PermissionResource,
} from "@/types/pengaturan/permission";

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

  value: string[];
  onChange: (next: string[]) => void;

  baseline?: string[];

  disabled?: boolean;
}

function resourcePerms(r: PermissionResource): string[] {
  return [
    ...r.actions.map((a) => a.permission),
    ...r.extras.map((e) => e.permission),
  ];
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
  const [query, setQuery] = React.useState("");
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(new Set());

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

  const allChecked = (perms: string[]) =>
    perms.length > 0 && perms.every(isChecked);
  const countChecked = (perms: string[]) =>
    perms.filter((p) => isChecked(p)).length;

  const q = query.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!q) return catalog;
    return catalog
      .map((g) => ({
        ...g,
        resources: g.resources.filter((r) =>
          r.label.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.resources.length > 0);
  }, [catalog, q]);

  const allPerms = React.useMemo(
    () => catalog.flatMap((g) => g.resources.flatMap(resourcePerms)),
    [catalog],
  );
  const totalChecked = countChecked(allPerms);
  const allExpanded =
    filtered.length > 0 && filtered.every((g) => openGroups.has(g.key));

  const setAllOpen = (open: boolean) =>
    setOpenGroups(open ? new Set(catalog.map((g) => g.key)) : new Set());

  return (
    <div className="flex flex-col gap-3">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu atau fitur"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {totalChecked} / {allPerms.length} hak akses
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAllOpen(!allExpanded)}
          >
            {allExpanded ? (
              <ChevronsDownUpIcon className="mr-1 size-4" />
            ) : (
              <ChevronsUpDownIcon className="mr-1 size-4" />
            )}
            {allExpanded ? "Ciutkan semua" : "Perluas semua"}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Menu atau fitur tidak ditemukan.
        </div>
      ) : (
        filtered.map((group) => {
          const gPerms = group.resources.flatMap(resourcePerms);
          const gAll = allChecked(gPerms);
          const gCount = countChecked(gPerms);
          const isOpen = q ? true : openGroups.has(group.key);

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
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  isOpen && "border-b",
                )}
              >
                <Checkbox
                  checked={gAll}
                  disabled={disabled}
                  onCheckedChange={() => toggleMany(gPerms, !gAll)}
                  aria-label={`Pilih semua ${group.label}`}
                />
                <CollapsibleTrigger className="group flex flex-1 items-center justify-between gap-2 text-left">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {group.label}
                    <span
                      className={cn(
                        "text-2xs font-medium tabular-nums",
                        gCount > 0 ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {gCount}/{gPerms.length}
                    </span>
                  </span>
                  <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-2xs uppercase tracking-wide">
                          Menu / Fitur
                        </TableHead>
                        {ACTION_COLUMNS.map((c) => (
                          <TableHead
                            key={c.action}
                            className="w-[70px] px-1 text-center text-2xs uppercase tracking-wide"
                          >
                            {c.label}
                          </TableHead>
                        ))}
                        <TableHead className="w-[60px] px-1 text-center text-2xs uppercase tracking-wide">
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
                              <div className="font-medium">{resource.label}</div>
                              {resource.extras.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
                                  {resource.extras.map((extra) => {
                                    const locked = isLocked(extra.permission);
                                    return (
                                      <label
                                        key={extra.permission}
                                        title={
                                          baseSet.has(extra.permission)
                                            ? "Diberikan oleh peran"
                                            : undefined
                                        }
                                        className={cn(
                                          "flex items-center gap-1.5 text-xs text-muted-foreground",
                                          locked
                                            ? "cursor-default"
                                            : "cursor-pointer",
                                        )}
                                      >
                                        <Checkbox
                                          checked={isChecked(extra.permission)}
                                          disabled={locked}
                                          onCheckedChange={() =>
                                            toggleOne(extra.permission)
                                          }
                                        />
                                        {extra.label}
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </TableCell>

                            {ACTION_COLUMNS.map((col) => {
                              const perm = actionByKey.get(col.action);
                              const fromRole = perm ? baseSet.has(perm) : false;
                              return (
                                <TableCell
                                  key={col.action}
                                  className="px-1 py-2.5 text-center"
                                >
                                  {perm ? (
                                    <span
                                      className="inline-flex"
                                      title={
                                        fromRole
                                          ? "Diberikan oleh peran"
                                          : undefined
                                      }
                                    >
                                      <Checkbox
                                        checked={isChecked(perm)}
                                        disabled={isLocked(perm)}
                                        onCheckedChange={() => toggleOne(perm)}
                                        aria-label={`${col.label} ${resource.label}`}
                                      />
                                    </span>
                                  ) : (
                                    <span className="inline-block size-1 rounded-full bg-muted-foreground/20" />
                                  )}
                                </TableCell>
                              );
                            })}

                            <TableCell className="px-1 py-2.5 text-center">
                              <Checkbox
                                checked={rAll}
                                disabled={disabled}
                                onCheckedChange={() => toggleMany(rPerms, !rAll)}
                                aria-label={`Pilih semua ${resource.label}`}
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
        })
      )}

      {baseSet.size > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <LockIcon className="size-3" />
          Centang abu-abu berasal dari peran dan diatur di halaman Peran.
        </p>
      )}
    </div>
  );
}
