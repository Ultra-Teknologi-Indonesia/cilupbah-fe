"use client"

import { useState } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { UsersIcon, Loader2Icon } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { useUsers } from "@/hooks/pengaturan/use-users"
import { fetchClient } from "@/lib/api-client"
import { toast } from "sonner"
import type { Inbound } from "@/types/barang-masuk/inbound"
import { useRouter } from "next/navigation"

interface BuatPenempatanManualDialogProps {
  inbound: Inbound | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BuatPenempatanManualDialog({ inbound, open, onOpenChange }: BuatPenempatanManualDialogProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: usersData, isLoading: usersLoading } = useUsers({ perPage: 100 })
  const [assignedTo, setAssignedTo] = useState("")

  const userOptions = (usersData?.items ?? []).map((u) => ({
    value: u.id,
    label: `${u.name}`,
  }))

  const mutation = useMutation({
    mutationFn: async () => {
      if (!inbound) throw new Error("Inbound required")
      const res = await fetchClient<{ data: any, error?: string }>("/putaway", {
        method: "POST",
        data: {
          inbound_id: inbound.id,
          assigned_to: assignedTo || undefined,
        },
      })
      if (res.error) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      toast.success("Dokumen penempatan berhasil dibuat")
      queryClient.invalidateQueries({ queryKey: ["putaways"] })
      queryClient.invalidateQueries({ queryKey: ["inbounds"] })
      onOpenChange(false)
      setAssignedTo("")
      router.push("/dashboard/barang-masuk/penempatan")
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat penempatan")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Penempatan Manual</DialogTitle>
          <DialogDescription>
            Pilih pengguna yang akan melakukan penempatan barang ke rak untuk Inbound {inbound?.transaction_number}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Tugaskan Kepada (Opsional)</Label>
            <div className="flex gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-muted/50">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Combobox
                options={userOptions}
                value={assignedTo}
                onChange={(v) => setAssignedTo(v ?? "")}
                placeholder={usersLoading ? "Memuat..." : "Pilih pengguna..."}
                searchPlaceholder="Cari pengguna..."
                className="flex-1"
                disabled={usersLoading}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Buat Penempatan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
