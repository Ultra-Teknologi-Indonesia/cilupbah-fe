"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useUserDetail, useDeleteUser } from "@/hooks/pengaturan/use-users"
import { UserFormDialog } from "./user-form-dialog"
import { useUpdateUser } from "@/hooks/pengaturan/use-users"
import type { UserFormPayload } from "@/types/pengaturan/user"

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === "string" && msg) return msg
  }
  return fallback
}

function formatDate(iso: string | null): string {
  if (!iso) return "-"
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return "-"
  }
}

interface UserDetailPageProps {
  userId: string
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const router = useRouter()
  const { data: user, isLoading, isError } = useUserDetail(userId)
  const deleteUser = useDeleteUser()
  const updateUser = useUpdateUser()
  const [showEdit, setShowEdit] = React.useState(false)
  const [showDelete, setShowDelete] = React.useState(false)

  function handleDelete() {
    deleteUser.mutate(userId, {
      onSuccess: () => {
        toast.success("Pengguna berhasil dihapus.")
        router.push("/dashboard/pengaturan/pengguna")
      },
      onError: (err) => toast.error(getErrorMessage(err, "Gagal menghapus pengguna.")),
    })
  }

  function handleUpdate(payload: UserFormPayload) {
    updateUser.mutate(
      { id: userId, payload },
      {
        onSuccess: () => {
          toast.success("Pengguna berhasil diperbarui.")
          setShowEdit(false)
        },
        onError: (err) => toast.error(getErrorMessage(err, "Gagal memperbarui pengguna.")),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" /> Memuat data pengguna…
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="py-24 text-center text-sm text-destructive">
        Gagal memuat data pengguna.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeftIcon className="mr-1 size-4" />
          Kembali
        </Button>

        <div className="flex gap-2">
          {!user.isOwner && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDelete(true)}
            >
              <Trash2Icon className="mr-1 size-4" />
              Hapus
            </Button>
          )}
          <Button size="sm" onClick={() => setShowEdit(true)}>
            <PencilIcon className="mr-1 size-4" />
            Edit
          </Button>
        </div>
      </div>

      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
        <div className="space-y-6 p-6">
          <h2 className="text-lg font-semibold">Informasi Pengguna</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Nama Pengguna" value={user.fullName || "-"} />
            <InfoRow label="Email" value={user.email} />
            <div>
              <p className="text-sm text-muted-foreground">Peran Pengguna</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {user.roles.length > 0
                  ? user.roles.map((r) => (
                      <Badge key={r.roleId} variant="secondary">
                        {r.roleName}
                      </Badge>
                    ))
                  : <span className="text-sm">-</span>}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lokasi</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {user.locations.length > 0
                  ? user.locations.map((l) => (
                      <Badge key={l.locationId} variant="outline">
                        {l.locationName}
                      </Badge>
                    ))
                  : <span className="text-sm">-</span>}
              </div>
            </div>
            <InfoRow label="Login Terakhir" value={formatDate(user.lastLogin)} />
            <InfoRow label="Tipe Akun" value={user.isOwner ? "Owner" : "Staff"} />
          </div>
        </div>
      </LiquidGlass>

      <UserFormDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        user={user}
        loading={updateUser.isPending}
        onSubmit={handleUpdate}
      />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Hapus Pengguna"
        description={`Apakah Anda yakin ingin menghapus pengguna ${user.fullName}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteUser.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}
