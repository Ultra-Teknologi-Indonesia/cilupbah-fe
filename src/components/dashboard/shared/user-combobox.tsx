"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, Loader2Icon, SearchIcon, UserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUsers } from "@/hooks/pengaturan/use-users"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

export interface UserComboboxValue {
  id: string
  name: string
}

interface UserComboboxProps {
  value: string | null
  onChange: (userId: string | null, user?: UserComboboxValue) => void
  /** Filter user berdasarkan role (server-side). Boleh 1 atau beberapa role. */
  role?: string | string[]
  /** Label yang ditampilkan saat value sudah diset dari luar (mis. default user login). */
  selectedLabel?: string | null
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
}

/**
 * Pilih user via combobox dengan pencarian ke API (Spatie: search + filter[role]).
 * Hanya menampilkan user sesuai role field-nya. Bukan input teks bebas.
 */
export function UserCombobox({
  value,
  onChange,
  role,
  selectedLabel,
  placeholder = "Pilih petugas…",
  disabled,
  invalid,
  className,
}: UserComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [label, setLabel] = React.useState<string | null>(selectedLabel ?? null)
  const debounced = useDebouncedValue(query, 250)

  React.useEffect(() => {
    setLabel(selectedLabel ?? null)
  }, [selectedLabel])

  const { data, isFetching } = useUsers({
    perPage: 20,
    search: debounced || undefined,
    "filter[role]": role,
  })

  const users = data?.items ?? []

  const handleSelect = (u: { id: string; name: string }) => {
    setLabel(u.name)
    onChange(u.id, { id: u.id, name: u.name })
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-full border border-border bg-background px-3 text-sm outline-none transition-[color,box-shadow]",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive ring-3 ring-destructive/20",
            className
          )}
        >
          <span className={cn("flex min-w-0 items-center gap-2 truncate", !value && "text-muted-foreground")}>
            <UserIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{value ? (label ?? "Terpilih") : placeholder}</span>
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) gap-0 p-0">
        <div className="flex items-center gap-2 border-b border-border/60 px-3">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama petugas…"
            className="h-10 border-0 bg-transparent px-0 focus-visible:ring-0"
          />
          {isFetching && <Loader2Icon className="size-4 shrink-0 animate-spin text-muted-foreground" />}
        </div>
        <div className="max-h-64 overflow-y-auto overscroll-contain p-1.5">
          {users.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {isFetching ? "Memuat…" : "Petugas tidak ditemukan."}
            </div>
          ) : (
            <ul>
              {users.map((u) => {
                const active = u.id === value
                return (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect({ id: u.id, name: u.name })}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-full px-2.5 py-2 text-left text-sm transition-colors",
                        active ? "bg-primary/10 text-primary" : "hover:bg-muted/60"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <CheckIcon className={cn("size-4 shrink-0", active ? "opacity-100" : "opacity-0")} />
                        <span className="truncate">{u.name}</span>
                      </span>
                      {u.email && <span className="shrink-0 truncate text-xs text-muted-foreground">{u.email}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
