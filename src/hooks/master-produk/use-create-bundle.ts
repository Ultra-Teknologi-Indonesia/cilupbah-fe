"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { BundleService, type CreateBundlePayload } from "@/services/master-produk/bundle.service"

export const useCreateBundle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBundlePayload) => BundleService.store(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["master-produk", "list"] })
    },
  })
}
