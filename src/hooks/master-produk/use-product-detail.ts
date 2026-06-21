"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  ProductDetailService,
  type LifecycleAction,
} from "@/services/master-produk/product-detail.service"

export const productDetailKey = (id: string) => ["master-produk", "detail", id]

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: productDetailKey(id),
    queryFn: () => ProductDetailService.get(id),
    enabled: !!id,
  })
}

const ACTION_LABEL: Record<LifecycleAction, string> = {
  approve: "Produk disetujui menjadi Master",
  archive: "Produk diarsipkan",
  restore: "Produk dipulihkan",
}

export function useProductLifecycle(id: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      action,
      reason,
    }: {
      action: LifecycleAction
      reason?: string
    }) =>
      ProductDetailService.lifecycle(id, action, {
        ...(reason ? { reason } : {}),
      }),
    onSuccess: (_data, { action }) => {
      toast.success(ACTION_LABEL[action])
      qc.invalidateQueries({ queryKey: productDetailKey(id) })
      qc.invalidateQueries({ queryKey: ["master-produk", "list"] })
    },
    onError: (err) => {
      const message = (err as { message?: string })?.message
      toast.error(message || "Aksi gagal diproses")
    },
  })
}
