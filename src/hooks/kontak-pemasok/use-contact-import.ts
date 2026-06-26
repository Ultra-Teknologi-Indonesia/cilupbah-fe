import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ContactImportService } from "@/services/kontak-pemasok/contact-import.service"
import type { ImportValidRow } from "@/types/kontak-pemasok/import"

export function useValidateImport() {
  return useMutation({
    mutationFn: (file: File) => ContactImportService.validate(file),
    onError: (err: any) => {
      toast.error(err?.message ?? "Gagal memvalidasi file")
    },
  })
}

export function useSaveImport() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (rows: ImportValidRow[]) => ContactImportService.save(rows),
    onSuccess: (data) => {
      toast.success(`${data.created} kontak berhasil diimport`)
      qc.invalidateQueries({ queryKey: ["contacts"] })
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Gagal menyimpan data import")
    },
  })
}
