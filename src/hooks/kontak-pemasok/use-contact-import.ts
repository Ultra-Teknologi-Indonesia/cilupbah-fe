import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ContactImportService } from "@/services/kontak-pemasok/contact-import.service"
import type { ImportValidRow } from "@/types/kontak-pemasok/import"

// Unduh template Excel. Dikembalikan sebagai callback agar dipanggil imperatif
// dari tombol (bukan efek query). Service memicu download blob langsung.
export function useDownloadImportTemplate() {
  return ContactImportService.downloadTemplate
}

export function useValidateImport() {
  return useMutation({
    mutationFn: (file: File) => ContactImportService.validate(file),
    onError: (err) => {
      toast.error((err as { message?: string })?.message ?? "Gagal memvalidasi file")
    },
  })
}

export function useSaveImport() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (rows: ImportValidRow[]) => ContactImportService.save(rows),
    onSuccess: (data) => {
      toast.success(`${data.created} kontak berhasil diimport`)
      qc.invalidateQueries({ queryKey: ["contact"] })
    },
    onError: (err) => {
      toast.error((err as { message?: string })?.message ?? "Gagal menyimpan data import")
    },
  })
}
