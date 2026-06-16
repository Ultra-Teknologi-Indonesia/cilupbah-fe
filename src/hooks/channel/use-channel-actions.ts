"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  ChannelService,
  type StoreFlags,
} from "@/services/channel/channel.service"
import type { ChannelCode, RawConnectedStore } from "@/types/channel"
import { CHANNEL_STORES_KEY } from "./use-connected-stores"

function errMessage(err: unknown, fallback: string): string {
  const m = (err as { message?: string })?.message
  return typeof m === "string" && m ? m : fallback
}


export function useToggleStoreFlag() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, flags }: { id: string; flags: StoreFlags }) =>
      ChannelService.setStoreFlags(id, flags),
    onMutate: async ({ id, flags }) => {
      await qc.cancelQueries({ queryKey: CHANNEL_STORES_KEY })
      const prev = qc.getQueryData<RawConnectedStore[]>(CHANNEL_STORES_KEY)
      qc.setQueryData<RawConnectedStore[]>(CHANNEL_STORES_KEY, (old) =>
        old?.map((s) => (s.id === id ? { ...s, ...flags } : s))
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(CHANNEL_STORES_KEY, ctx.prev)
      toast.error(errMessage(err, "Gagal memperbarui pengaturan toko"))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: CHANNEL_STORES_KEY }),
  })
}


export function useDisconnectStore() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ChannelService.disconnect(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: CHANNEL_STORES_KEY })
      const prev = qc.getQueryData<RawConnectedStore[]>(CHANNEL_STORES_KEY)
      qc.setQueryData<RawConnectedStore[]>(CHANNEL_STORES_KEY, (old) =>
        old?.filter((s) => s.id !== id)
      )
      return { prev }
    },
    onError: (err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(CHANNEL_STORES_KEY, ctx.prev)
      toast.error(errMessage(err, "Gagal memutuskan toko"))
    },
    onSuccess: () => toast.success("Toko diputuskan"),
    onSettled: () => qc.invalidateQueries({ queryKey: CHANNEL_STORES_KEY }),
  })
}

export function useRefreshToken() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ channel, id }: { channel: ChannelCode; id: string }) =>
      ChannelService.refreshToken(channel, id),
    onSuccess: () => {
      toast.success("Token toko diperbarui")
      qc.invalidateQueries({ queryKey: CHANNEL_STORES_KEY })
    },
    onError: (err) =>
      toast.error(
        errMessage(err, "Gagal memperbarui token. Mungkin perlu hubungkan ulang.")
      ),
  })
}


export function useConnectChannel() {
  const [pendingCode, setPendingCode] = React.useState<ChannelCode | null>(null)

  const connect = React.useCallback(async (channel: ChannelCode) => {
    setPendingCode(channel)
    try {
      const url = await ChannelService.getAuthUrl(channel)
      window.location.href = url
    } catch (err) {
      setPendingCode(null)
      toast.error(errMessage(err, "Gagal memulai koneksi marketplace"))
    }
  }, [])

  return { connect, pendingCode }
}
