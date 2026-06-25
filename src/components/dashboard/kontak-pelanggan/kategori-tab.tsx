"use client"

import { useState, useCallback } from "react"
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  TagIcon,
  Loader2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useContactCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/kontak-pemasok/use-contacts"
import type { ContactCategory, CategoryFormData } from "@/types/kontak-pemasok/contact"

const TYPE_OPTIONS = [
  { value: "BOTH", label: "Semua (Pelanggan & Pemasok)" },
  { value: "CUSTOMER", label: "Pelanggan" },
  { value: "SUPPLIER", label: "Pemasok" },
]

const TYPE_LABELS: Record<string, string> = {
  CUSTOMER: "Pelanggan",
  SUPPLIER: "Pemasok",
  BOTH: "Semua",
}

function Req() {
  return <span className="text-destructive"> *</span>
}

const EMPTY_FORM: CategoryFormData = { code: "", name: "", description: "", type: "BOTH" }

export function KategoriTab() {
  const { data: categories = [], isLoading } = useContactCategories()
  const createMut = useCreateCategory()
  const updateMut = useUpdateCategory()
  const deleteMut = useDeleteCategory()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ContactCategory | null>(null)
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<ContactCategory | null>(null)

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(cat: ContactCategory) {
    setEditTarget(cat)
    setForm({
      code: cat.code ?? "",
      name: cat.name,
      description: cat.description ?? "",
      type: cat.type ?? "BOTH",
    })
    setModalOpen(true)
  }

  function set<K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) return
    try {
      if (editTarget) {
        await updateMut.mutateAsync({ id: editTarget.id, data: form })
      } else {
        await createMut.mutateAsync(form)
      }
      setModalOpen(false)
      setEditTarget(null)
    } catch {}
  }

  const saving = createMut.isPending || updateMut.isPending

  return (
    <>
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={openCreate}>
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <div className="px-4 py-3 sm:px-5">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <TagIcon className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">Belum ada kategori</p>
                <p className="mt-1 text-xs">Tambah kategori untuk mengelompokkan kontak.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    {["Kode", "Nama", "Tipe", "Deskripsi", "Aksi"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-muted-foreground">
                        {cat.code ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-medium">
                        {cat.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] leading-tight",
                            cat.type === "CUSTOMER"
                              ? "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400"
                              : cat.type === "SUPPLIER"
                                ? "border-orange-300 text-orange-600 dark:border-orange-500/30 dark:text-orange-400"
                                : "border-purple-300 text-purple-600 dark:border-purple-500/30 dark:text-purple-400"
                          )}
                        >
                          {TYPE_LABELS[cat.type ?? "BOTH"] ?? "Semua"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {cat.description || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)} aria-label="Edit">
                            <PencilIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(cat)}
                            aria-label="Hapus"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2Icon className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </LiquidGlass>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Kode<Req /></Label>
                <Input
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                  placeholder="Cth: KAT-001"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nama<Req /></Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Nama kategori"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipe</Label>
              <Combobox
                options={TYPE_OPTIONS}
                value={form.type ?? "BOTH"}
                onChange={(v) => set("type", (v as "CUSTOMER" | "SUPPLIER" | "BOTH") ?? "BOTH")}
                placeholder="Pilih tipe"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Deskripsi opsional"
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !form.code.trim() || !form.name.trim()}>
              {saving && <Loader2Icon className="animate-spin" />}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus Kategori"
        description={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.name}"? Kategori yang masih digunakan oleh kontak tidak dapat dihapus.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
      />
    </>
  )
}
