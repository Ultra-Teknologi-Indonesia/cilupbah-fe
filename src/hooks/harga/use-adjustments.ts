"use client"

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { AdjustmentService } from "@/services/harga/adjustment.service"
import type { AdjustmentListParams, CreateAdjustmentPayload } from "@/types/harga/adjustment"

export const adjustmentKeys = {
  all: ["harga", "adjustments"] as const,
  list: (params: AdjustmentListParams) => [...adjustmentKeys.all, "list", params] as const,
  detail: (id: string) => [...adjustmentKeys.all, "detail", id] as const,
}

export function useAdjustments(params: AdjustmentListParams = {}) {
  return useQuery({
    queryKey: adjustmentKeys.list(params),
    queryFn: () => AdjustmentService.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}

export function useAdjustmentDetail(id: string) {
  return useQuery({
    queryKey: adjustmentKeys.detail(id),
    queryFn: () => AdjustmentService.show(id),
    enabled: !!id,
  })
}

export function useCreateAdjustment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAdjustmentPayload) => AdjustmentService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adjustmentKeys.all })
    },
  })
}

export function useApplyAdjustment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AdjustmentService.apply(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adjustmentKeys.all })
    },
  })
}

export function useCancelAdjustment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AdjustmentService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adjustmentKeys.all })
    },
  })
}

export function useDeleteAdjustment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AdjustmentService.destroy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adjustmentKeys.all })
    },
  })
}
