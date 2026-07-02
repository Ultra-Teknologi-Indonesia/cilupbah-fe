"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2Icon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useUsers, useDeleteUser } from "@/hooks/pengaturan/use-users"
import type { User } from "@/types/pengaturan/user"

function formatRoles(roles: string[]): string {
  if (roles.length === 0) return "-"
  const first = roles[0].charAt(0).toUpperCase() + roles[0].slice(1)
  if (roles.length === 1) return first
  return `${first} dan ${roles.length - 1} peran lainnya`
}

function formatDate(iso: string | null): string {
  if (!iso) return "-"
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return "-"
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === "string" && msg) return msg
  }
  return fallback
}

export function UserListView() {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null)

  const perPage = 20

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, isError, isFetching } = useUsers({ search, page, perPage })
  const deleteUser = useDeleteUser()

  const users = data?.items ?? []
  const total = data?.meta?.total ?? 0
  const lastPage = data?.meta?.last_page ?? 1

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleToggleAll() {
    if (users.every((u) => selectedIds.has(u.id))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)))
    }
  }

  function handleBulkDelete() {
    if (selectedIds.size === 0) return
    const first = users.find((u) => selectedIds.has(u.id))
    if (first) setDeleteTarget(first)
  }

  const columns = React.useMemo<ColumnDef<User>[]>(() => [
    {
      id: "select",
      header: ({ table }) => {
        const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));
        return (
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleToggleAll}
            aria-label="Pilih semua"
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={() => handleToggleSelect(row.original.id)}
          aria-label={`Pilih ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nama Pengguna",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/pengaturan/pengguna/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.name || row.original.email}
        </Link>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-foreground">{row.original.email}</span>,
    },
    {
      accessorKey: "roles",
      header: "Peran Pengguna",
      cell: ({ row }) => <span className="text-foreground">{formatRoles(row.original.roles)}</span>,
    },
    {
      accessorKey: "lastLoginAt",
      header: "Login Terakhir",
      cell: ({ row }) => <span className="text-foreground">{formatDate(row.original.lastLoginAt)}</span>,
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end">
            {!user.roles.includes("owner") && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(user)}
                aria-label={`Hapus ${user.name}`}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      },
    },
  ], [selectedIds, users])

  function handleConfirmDelete() {
    if (!deleteTarget) return
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Pengguna berhasil dihapus.")
        setDeleteTarget(null)
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(deleteTarget.id)
          return next
        })
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, "Gagal menghapus pengguna.")),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
          <div className="relative w-full max-w-xs">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari pengguna"
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleBulkDelete}
              >
                <Trash2Icon className="mr-1 size-4" />
                Hapus ({selectedIds.size})
              </Button>
            )}
            <Button size="sm" asChild>
              <Link href="/dashboard/pengaturan/pengguna/buat">
                <PlusIcon className="mr-1 size-4" />
                Buat Pengguna
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end px-5 py-3 text-sm text-muted-foreground">
          Total <Badge className="ml-2">{total}</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" /> Memuat pengguna…
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-destructive">
            Gagal memuat data pengguna.
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {search ? "Tidak ada pengguna yang cocok." : "Belum ada pengguna."}
          </div>
        ) : (
                    <div className="px-5 pb-5">
            <DataTable
              columns={columns}
              data={users}
              hideToolbar
              manualPagination
              pagination={{
                pageIndex: page - 1,
                pageSize: perPage,
              }}
              rowCount={total}
              onPaginationChange={(p) => {
                setPage(p.pageIndex + 1)
              }}
              tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
              emptyState={
                <div className="py-16 text-center text-sm text-muted-foreground">
                  {search ? "Tidak ada pengguna yang cocok." : "Belum ada pengguna."}
                </div>
              }
            />
          </div>
        )}
      </LiquidGlass>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteUser.isPending) setDeleteTarget(null)
        }}
        title="Hapus Pengguna"
        description={`Apakah Anda yakin ingin menghapus pengguna ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteUser.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
