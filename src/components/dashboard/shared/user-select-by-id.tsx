"use client";

import * as React from "react";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface UserSelectByIdOption {
  id: string;
  name: string;
  hint?: string;
}

interface UserSelectByIdProps {
  value: string;
  onChange: (id: string, item?: UserSelectByIdOption) => void;
  options: UserSelectByIdOption[];
  isLoading?: boolean;
  currentUserId?: string;
  defaultToSelf?: boolean;
  placeholder?: string;
  selfLabel?: string;
  emptyText?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  id?: string;
}

export function UserSelectById({
  value,
  onChange,
  options,
  isLoading,
  currentUserId,
  defaultToSelf,
  placeholder = "Pilih petugas…",
  selfLabel = "Saya sendiri",
  emptyText = "Tidak ada petugas.",
  disabled,
  invalid,
  className,
  id,
}: UserSelectByIdProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const currentUserInOptions = React.useMemo(
    () =>
      currentUserId
        ? (options.find((o) => o.id === currentUserId) ?? null)
        : null,
    [options, currentUserId],
  );

  React.useEffect(() => {
    if (defaultToSelf && !value && currentUserInOptions) {
      onChange(currentUserInOptions.id, currentUserInOptions);
    }
  }, [defaultToSelf, value, currentUserInOptions, onChange]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, search]);

  const selected = options.find((o) => o.id === value) ?? null;

  const pick = (item: UserSelectByIdOption) => {
    onChange(item.id, item);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 flex-1 items-center justify-between gap-2 rounded-full border border-border bg-background px-3 text-sm outline-none transition-[color,box-shadow]",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
              invalid && "border-destructive ring-3 ring-destructive/20",
            )}
          >
            <span
              className={cn("truncate", !selected && "text-muted-foreground")}
            >
              {selected?.name ?? placeholder}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) gap-0 p-0"
        >
          <div className="flex items-center gap-2 border-b border-border/60 px-3">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama petugas…"
              className="h-10 border-0 bg-transparent px-0 focus-visible:ring-0"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto overscroll-contain p-1.5">
            {isLoading && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                Memuat…
              </li>
            )}
            {!isLoading && filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </li>
            )}
            {filtered.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => pick(u)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-full px-2.5 py-2 text-left text-sm transition-colors",
                    value === u.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/60",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <CheckIcon
                      className={cn(
                        "size-4 shrink-0",
                        value === u.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{u.name}</span>
                  </span>
                  {u.hint && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {u.hint}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      {currentUserInOptions && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => pick(currentUserInOptions)}
          className="shrink-0 gap-1"
        >
          <UserIcon className="size-3.5" />
          {selfLabel}
        </Button>
      )}
    </div>
  );
}
