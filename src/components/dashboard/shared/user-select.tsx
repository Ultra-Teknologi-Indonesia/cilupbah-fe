"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, SearchIcon, UserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUsers } from "@/hooks/pengaturan/use-users"
import { useMe } from "@/hooks/auth/use-auth"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

interface UserSelectProps {
  /** Nama petugas terpilih (kompatibel dgn penyimpanan string `*_by` di BE). */
  value: string
  onChange: (name: string) => void
  /** Filter user ke role tertentu (opsional). Contoh: "picker", "putaway", "warehouse". */
  role?: string | string[]
  /** Auto-isi user login saat kosong (untuk field "siapa yang melakukan"). */
  defaultToSelf?: boolean
  placeholder?: string
  selfLabel?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
}

/**
 * Pemilih petugas terpadu: cari via API (server-side, terfilter role) + tombol
 * "Saya sendiri" yang hanya muncul bila role user login cocok. Mengganti input
 * teks nama bebas di seluruh flow (approved_by/processed_by/created_by/dll).
 */
export function UserSelect({
  value,
  onChange,
  role,
  defaultToSelf,
  placeholder = "Pilih petugas…",
  selfLabel = "Saya sendiri",
  disabled,
  invalid,
  className,
}: UserSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const debounced = useDebouncedValue(search, 250)

  const { data: me } = useMe()
  const { data, isLoading } = useUsers({
    perPage: 20,
    search: debounced || undefined,
    "filter[role]": role,
  })
  const users = data?.items ?? []

  const myRoles = me?.roles ?? []
  const roleList = role ? (Array.isArray(role) ? role : [role]) : []
  const canSelf = !!me?.name && (roleList.length === 0 || roleList.some((r) => myRoles.includes(r)))

  // Auto-isi user login untuk field "siapa yang melakukan" (mis. created_by).
  React.useEffect(() => {
    if (defaultToSelf && !value && me?.name) onChange(me.name)
  }, [defaultToSelf, value, me?.name, onChange])

  const pick = (name: string) => {
    onChange(name)
    setOpen(false)
    setSearch("")
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setSearch("") }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 flex-1 items-center justify-between gap-2 rounded-full border border-border bg-background px-3 text-sm outline-none transition-[color,box-shadow]",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
              invalid && "border-destructive ring-3 ring-destructive/20"
            )}
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>{value || placeholder}</span>
            <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) gap-0 p-0">
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
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">Memuat…</li>
            )}
            {!isLoading && users.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada petugas.</li>
            )}
            {users.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => pick(u.name)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-full px-2.5 py-2 text-left text-sm transition-colors",
                    value === u.name ? "bg-primary/10 text-primary" : "hover:bg-muted/60"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <CheckIcon className={cn("size-4 shrink-0", value === u.name ? "opacity-100" : "opacity-0")} />
                    <span className="truncate">{u.name}</span>
                  </span>
                  {u.roles?.length ? (
                    <span className="shrink-0 text-xs text-muted-foreground">{u.roles.join(", ")}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      {canSelf && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => me?.name && onChange(me.name)}
          className="shrink-0 gap-1"
        >
          <UserIcon className="size-3.5" />
          {selfLabel}
        </Button>
      )}
    </div>
  )
}
