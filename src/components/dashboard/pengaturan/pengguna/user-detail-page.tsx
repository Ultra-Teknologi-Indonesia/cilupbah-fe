"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useUserDetail, useDeleteUser } from "@/hooks/pengaturan/use-users"

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

  const isOwner = user.roles.includes("owner")

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Informasi Pengguna</h2>
            <div className="flex gap-2">
              {!isOwner && (
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
              <Button
                size="sm"
                onClick={() => router.push(`/dashboard/pengaturan/pengguna/${userId}/edit`)}
              >
                <PencilIcon className="mr-1 size-4" />
                Edit
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Nama Pengguna" value={user.name || "-"} />
            <InfoRow label="NIK" value={user.nik || "-"} />
            <InfoRow label="Email" value={user.email} />
            <div>
              <p className="text-sm text-muted-foreground">Peran Pengguna</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {user.roles.length > 0
                  ? user.roles.map((r) => (
                      <Badge key={r} variant="secondary" className="capitalize">
                        {r}
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
            <InfoRow label="Login Terakhir" value={formatDate(user.lastLoginAt)} />
          </div>
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Hapus Pengguna"
        description={`Apakah Anda yakin ingin menghapus pengguna ${user.name}? Tindakan ini tidak dapat dibatalkan.`}
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
