"use client"

import * as React from "react"
import { Loader2Icon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/pengaturan/use-users"
import type { User, UserFormPayload } from "@/types/pengaturan/user"

import { UserTable } from "./user-table"
import { UserFormDialog } from "./user-form-dialog"

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
  const [showCreate, setShowCreate] = React.useState(false)

  const perPage = 10

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, isError, isFetching } = useUsers({ search, page, perPage })
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()

  const users = data?.items ?? []
  const total = data?.totalCount ?? 0
  const lastPage = Math.max(1, Math.ceil(total / perPage))

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

  function handleCreate(payload: UserFormPayload) {
    createUser.mutate(payload, {
      onSuccess: () => {
        toast.success("Pengguna berhasil ditambahkan.")
        setShowCreate(false)
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, "Gagal menambahkan pengguna.")),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <PlusIcon className="mr-1 size-4" />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Table */}
      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
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
          <UserTable
            users={users}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleAll={handleToggleAll}
            onDelete={(user) => setDeleteTarget(user)}
          />
        )}

        {!isLoading && !isError && (
          <div className="px-5 pb-3">
            <SimplePagination
              page={page}
              lastPage={lastPage}
              onPageChange={setPage}
              total={total}
              label="pengguna"
              isFetching={isFetching}
            />
          </div>
        )}
      </LiquidGlass>

      {/* Create Dialog */}
      <UserFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        loading={createUser.isPending}
        onSubmit={handleCreate}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteUser.isPending) setDeleteTarget(null)
        }}
        title="Hapus Pengguna"
        description={`Apakah Anda yakin ingin menghapus pengguna ${deleteTarget?.fullName}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteUser.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
