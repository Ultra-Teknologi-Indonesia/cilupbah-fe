"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ContactService } from "@/services/kontak-pemasok/contact.service"
import type { ContactListParams, ContactFormData, CategoryFormData } from "@/types/kontak-pemasok/contact"

const STALE = 60 * 1000

export function useContacts(params: ContactListParams = {}) {
  return useQuery({
    queryKey: ["contact", "list", params],
    queryFn: () => ContactService.list(params),
    staleTime: STALE,
  })
}

export function useContactDetail(id?: string) {
  return useQuery({
    queryKey: ["contact", "detail", id],
    queryFn: () => ContactService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useContactCategories() {
  return useQuery({
    queryKey: ["contact", "categories"],
    queryFn: () => ContactService.getCategories(),
    staleTime: STALE,
  })
}

export function useAccountPayableOptions() {
  return useQuery({
    queryKey: ["contact", "account-payable"],
    queryFn: () => ContactService.getAccountPayableOptions(),
    staleTime: STALE,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ContactService.create,
    onSuccess: () => {
      toast.success("Kontak berhasil ditambahkan")
      qc.invalidateQueries({ queryKey: ["contact"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menambahkan kontak"),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactFormData }) =>
      ContactService.update(id, data),
    onSuccess: () => {
      toast.success("Kontak berhasil diperbarui")
      qc.invalidateQueries({ queryKey: ["contact"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memperbarui kontak"),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ContactService.delete,
    onSuccess: () => {
      toast.success("Kontak berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["contact"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus kontak"),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ContactService.createCategory,
    onSuccess: () => {
      toast.success("Kategori berhasil ditambahkan")
      qc.invalidateQueries({ queryKey: ["contact", "categories"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menambahkan kategori"),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      ContactService.updateCategory(id, data),
    onSuccess: () => {
      toast.success("Kategori berhasil diperbarui")
      qc.invalidateQueries({ queryKey: ["contact", "categories"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memperbarui kategori"),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ContactService.deleteCategory,
    onSuccess: () => {
      toast.success("Kategori berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["contact", "categories"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus kategori"),
  })
}
