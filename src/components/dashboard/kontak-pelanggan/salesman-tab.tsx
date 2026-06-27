"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  BadgeCheckIcon,
  DownloadIcon,
  Loader2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useSalesmen,
  useSalesmanDetail,
  useCreateSalesman,
  useUpdateSalesman,
  useDeleteSalesman,
} from "@/hooks/kontak-pemasok/use-salesman"
import { exportCsv } from "@/lib/export-csv"
import type { SalesmanItem, SalesmanFormData } from "@/types/kontak-pemasok/salesman"

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
]

function TableSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 px-3 py-3">
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border-b border-border/20 px-3 py-3.5">
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Req() {
  return <span className="text-destructive"> *</span>
}

const EMPTY_FORM: SalesmanFormData = { name: "", phone: "", email: "", status: "active", notes: "" }

export function SalesmanTab() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<SalesmanFormData>(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<SalesmanItem | null>(null)

  const resetPage = useCallback(() => setPage(1), [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      resetPage()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, resetPage])

  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    "filter[status]": statusFilter || undefined,
  }), [debouncedSearch, page, perPage, statusFilter])

  const { data, isLoading, isFetching } = useSalesmen(params)
  const { data: editDetail } = useSalesmanDetail(editId ?? undefined)
  const createMut = useCreateSalesman()
  const updateMut = useUpdateSalesman()
  const deleteMut = useDeleteSalesman()

  const items = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const prefilledRef = useCallback(() => {}, [])
  useEffect(() => {
    if (editId && editDetail) {
      setForm({
        name: editDetail.name,
        phone: editDetail.phone ?? "",
        email: editDetail.email ?? "",
        status: editDetail.status ?? "active",
        notes: editDetail.notes ?? "",
      })
    }
  }, [editId, editDetail])

  function openCreate() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(item: SalesmanItem) {
    setEditId(item.id)
    setForm({
      name: item.name,
      phone: item.phone ?? "",
      email: item.email ?? "",
      status: item.status ?? "active",
      notes: item.notes ?? "",
    })
    setModalOpen(true)
  }

  function set<K extends keyof SalesmanFormData>(key: K, value: SalesmanFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) return
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data: form })
      } else {
        await createMut.mutateAsync(form)
      }
      setModalOpen(false)
      setEditId(null)
    } catch {}
  }

  const saving = createMut.isPending || updateMut.isPending

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      "salesman.csv",
      ["Kode", "Nama", "Telepon", "Email", "Status"],
      items.map((s: SalesmanItem) => [
        s.code,
        s.name,
        s.phone ?? "",
        s.email ?? "",
        s.status,
      ])
    )
  }, [items])

  const hasFilter = !!statusFilter
  const activeCount = statusFilter ? 1 : 0

  return (
    <>
      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari nama, kode, email..."
          align="end"
          onReset={hasFilter ? () => { setStatusFilter(""); resetPage() } : undefined}
          hasFilter={hasFilter}
          activeCount={activeCount}
          gridCols={2}
          leading={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={items.length === 0}>
                <DownloadIcon className="mr-1.5 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="primary" size="sm" onClick={openCreate}>
                <PlusIcon className="mr-1.5 h-4 w-4" />
                Tambah Salesman
              </Button>
            </div>
          }
        >
          <Combobox
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v ?? ""); resetPage() }}
            placeholder="Status"
            searchPlaceholder="Cari status"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        {isFetching && !isLoading && (
          <div className="flex justify-center py-1">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        <div className="px-4 py-3 sm:px-5">
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <BadgeCheckIcon className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">Belum ada salesman</p>
                <p className="mt-1 text-xs">Tambah salesman baru untuk mengelola tim penjualan.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      {["Kode", "Nama", "Telepon", "Email", "Status", "Aksi"].map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: SalesmanItem) => (
                      <tr
                        key={item.id}
                        className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40"
                      >
                        <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-muted-foreground">
                          {item.code}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-medium">
                          {item.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.phone || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.email || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] leading-tight",
                              item.status === "active"
                                ? "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400"
                                : "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400"
                            )}
                          >
                            {item.status === "active" ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)} aria-label="Edit">
                              <PencilIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteTarget(item)}
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

              <SimplePagination
                page={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={setPage}
                perPage={meta.per_page}
                onPerPageChange={(s) => { setPerPage(s); resetPage() }}
                pageSizeOptions={[15, 30, 50]}
                total={meta.total}
                label="salesman"
              />
            </div>
          )}
        </div>
      </LiquidGlass>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Salesman" : "Tambah Salesman"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Nama<Req /></Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Masukkan nama salesman"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Telepon</Label>
                <Input
                  value={form.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+628xxxxx"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="email@contoh.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Combobox
                options={[
                  { value: "active", label: "Aktif" },
                  { value: "inactive", label: "Nonaktif" },
                ]}
                value={form.status ?? "active"}
                onChange={(v) => set("status", (v as "active" | "inactive") ?? "active")}
                placeholder="Pilih status"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea
                value={form.notes ?? ""}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Catatan opsional"
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving && <Loader2Icon className="animate-spin" />}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus Salesman"
        description={`Apakah Anda yakin ingin menghapus salesman "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
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
