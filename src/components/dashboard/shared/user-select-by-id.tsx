"use client";

import * as React from "react";
import { UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import type { LookupOption } from "@/types/common";

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

  const comboOptions = React.useMemo<LookupOption[]>(
    () =>
      options.map((o) => ({
        value: o.id,
        label: o.name,
        hint: o.hint,
      })),
    [options],
  );

  const handleChange = (next: string | null) => {
    const nextId = next ?? "";
    const item = nextId ? options.find((o) => o.id === nextId) : undefined;
    onChange(nextId, item);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Combobox
        id={id}
        options={comboOptions}
        value={value || null}
        onChange={handleChange}
        placeholder={placeholder}
        searchPlaceholder="Cari nama petugas…"
        emptyText={emptyText}
        loading={isLoading}
        disabled={disabled}
        invalid={invalid}
        className="flex-1"
      />

      {currentUserInOptions && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() =>
            onChange(currentUserInOptions.id, currentUserInOptions)
          }
          className="shrink-0 gap-1"
        >
          <UserIcon className="size-3.5" />
          {selfLabel}
        </Button>
      )}
    </div>
  );
}
