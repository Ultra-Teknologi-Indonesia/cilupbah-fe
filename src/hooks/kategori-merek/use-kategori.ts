"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { KategoriService } from "@/services/kategori-merek/kategori.service"

const STALE = 60 * 1000

export function useEnabledCategories() {
  return useQuery({
    queryKey: ["kategori", "enabled-tree"],
    queryFn: KategoriService.getEnabledTree,
    staleTime: STALE,
  })
}

export function useSearchKategori(search: string) {
  return useQuery({
    queryKey: ["kategori", "search", search],
    queryFn: () => KategoriService.searchCategories(search),
    staleTime: STALE,
    enabled: search.length >= 2,
  })
}

export function useSystemCategories(enabled = false) {
  return useQuery({
    queryKey: ["kategori", "system"],
    queryFn: KategoriService.getSystemCategories,
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}

export function useKategoriMapping(params: { search?: string; page?: number; perPage?: number } = {}) {
  return useQuery({
    queryKey: ["kategori", "mapping", params],
    queryFn: () => KategoriService.getMappingList(params),
    staleTime: STALE,
  })
}

export function useCategoryFormAttributes(categoryId: number) {
  return useQuery({
    queryKey: ["kategori", "form-attributes", categoryId],
    queryFn: () => KategoriService.getCategoryFormAttributes(categoryId),
    staleTime: STALE,
    enabled: categoryId > 0,
  })
}

export function useChannelAttributes(channelCode: string, categoryId: number) {
  return useQuery({
    queryKey: ["kategori", "channel-attributes", channelCode, categoryId],
    queryFn: () => KategoriService.getChannelAttributes(channelCode, categoryId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(channelCode) && categoryId > 0,
  })
}

export function useCreateCategoryAttribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: number; data: { name: string; type: "spec" | "sales" } }) =>
      KategoriService.createCategoryAttribute(categoryId, data),
    onSuccess: () => {
      toast.success("Atribut berhasil ditambahkan")
      qc.invalidateQueries({ queryKey: ["kategori", "form-attributes"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menambahkan atribut"),
  })
}

export function useDeleteCategoryAttribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, attributeId }: { categoryId: number; attributeId: number }) =>
      KategoriService.deleteCategoryAttribute(categoryId, attributeId),
    onSuccess: () => {
      toast.success("Atribut berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["kategori", "form-attributes"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus atribut"),
  })
}

export function useChannelCategories(channelId: string) {
  return useQuery({
    queryKey: ["kategori", "channel-categories", channelId],
    queryFn: () => KategoriService.getChannelCategories(channelId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(channelId),
  })
}

export function useMapCategoryToChannel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, channelCategoryIds }: { categoryId: number; channelCategoryIds: string[] }) =>
      KategoriService.mapCategoryToChannel(categoryId, channelCategoryIds),
    onSuccess: () => {
      toast.success("Kategori berhasil dipetakan ke channel")
      qc.invalidateQueries({ queryKey: ["kategori", "mapping"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memetakan kategori"),
  })
}

export function useMapAttributeToChannel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ attributeId, channelAttributeIds }: { attributeId: number; channelAttributeIds: string[] }) =>
      KategoriService.mapAttributeToChannel(attributeId, channelAttributeIds),
    onSuccess: () => {
      toast.success("Atribut berhasil dipetakan ke channel")
      qc.invalidateQueries({ queryKey: ["kategori", "form-attributes"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memetakan atribut"),
  })
}

export function useEnableKategori() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: KategoriService.enableCategories,
    onSuccess: (data) => {
      toast.success(`Berhasil mengimpor ${data.enabled_count} kategori`)
      qc.invalidateQueries({ queryKey: ["kategori"] })
      qc.invalidateQueries({ queryKey: ["master-produk", "lookup", "categories"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal mengimpor kategori"),
  })
}

export function useDisableKategori() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: KategoriService.disableCategories,
    onSuccess: (data) => {
      toast.success(`Berhasil menonaktifkan ${data.disabled_count} kategori`)
      qc.invalidateQueries({ queryKey: ["kategori"] })
      qc.invalidateQueries({ queryKey: ["master-produk", "lookup", "categories"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menonaktifkan kategori"),
  })
}

export function useCreateKategori() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: KategoriService.createCategory,
    onSuccess: () => {
      toast.success("Kategori berhasil dibuat")
      qc.invalidateQueries({ queryKey: ["kategori"] })
      qc.invalidateQueries({ queryKey: ["master-produk", "lookup", "categories"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal membuat kategori"),
  })
}

export function useUpdateKategori() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      KategoriService.updateCategory(id, { name }),
    onSuccess: () => {
      toast.success("Kategori berhasil diperbarui")
      qc.invalidateQueries({ queryKey: ["kategori"] })
      qc.invalidateQueries({ queryKey: ["master-produk", "lookup", "categories"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memperbarui kategori"),
  })
}

export function useDeleteKategori() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: KategoriService.deleteCategory,
    onSuccess: () => {
      toast.success("Kategori berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["kategori"] })
      qc.invalidateQueries({ queryKey: ["master-produk", "lookup", "categories"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus kategori"),
  })
}
