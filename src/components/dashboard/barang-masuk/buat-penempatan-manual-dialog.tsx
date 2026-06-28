"use client"

import { useState } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { UsersIcon, Loader2Icon } from "lucide-react"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  const { data: usersData, isLoading: usersLoading } = useUsers({ perPage: 100, "filter[role]": "putaway" })
  const [assignedTo, setAssignedTo] = useState("")

  const totalSku = inbound?.items?.length ?? 0
  const totalQty = inbound?.items?.reduce((acc, i) => acc + i.expected_qty, 0) ?? 0

  const userOptions = (usersData?.items ?? []).map((u) => ({
    value: u.id,
    label: `${u.name}`,
  }))

  const mutation = useMutation({
    mutationFn: async () => {
      if (!inbound) throw new Error("Inbound required")
      const assignedToId = assignedTo
      const res = await fetchClient<{ data: any, error?: string }>(`/inbounds/${inbound.id}/assign`, {
        method: "POST",
        data: {
          assigned_to: assignedToId || undefined,
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
          <DialogTitle>Penempatan Manual</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <Label className="text-sm font-medium text-muted-foreground">Total SKU</Label>
            <Input value={totalSku} disabled className="bg-white/50 dark:bg-white/[0.02]" />
          </div>
          
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <Label className="text-sm font-medium text-muted-foreground">Total Qty</Label>
            <Input value={totalQty} disabled className="bg-white/50 dark:bg-white/[0.02]" />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <Label className="text-sm font-medium text-muted-foreground">Tugaskan Ke</Label>
            <Combobox
              options={userOptions}
              value={assignedTo}
              onChange={(v) => setAssignedTo(v ?? "")}
              placeholder={usersLoading ? "Memuat..." : "Pilih pengguna..."}
              searchPlaceholder="Cari pengguna..."
              className="w-full"
              disabled={usersLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !assignedTo} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
            {mutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
