"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";

const DEFAULT_STALE = 30_000;

export interface ResourceKeys {
  all: readonly string[];

  lists: readonly unknown[];
  list: (params: unknown) => QueryKey;

  details: readonly unknown[];
  detail: (id: string) => QueryKey;
}

export function createResourceKeys(root: string): ResourceKeys {
  const all = [root] as const;
  const lists = [...all, "list"] as const;
  const details = [...all, "detail"] as const;
  return {
    all,
    lists,
    list: (params) => [...lists, params],
    details,
    detail: (id) => [...details, id],
  };
}

export function createListHook<TParams, TData>(
  keys: ResourceKeys,
  fetcher: (params: TParams) => Promise<TData>,
  opts?: { staleTime?: number },
) {
  return function useList(params: TParams, options?: { enabled?: boolean }) {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => fetcher(params),
      staleTime: opts?.staleTime ?? DEFAULT_STALE,
      placeholderData: keepPreviousData,
      enabled: options?.enabled ?? true,
    });
  };
}

export function createDetailHook<TData>(
  keys: ResourceKeys,
  fetcher: (id: string) => Promise<TData>,
  opts?: { staleTime?: number },
) {
  return function useDetail(id?: string) {
    return useQuery({
      queryKey: keys.detail(id ?? ""),
      queryFn: () => fetcher(id!),
      enabled: !!id,
      staleTime: opts?.staleTime ?? DEFAULT_STALE,
    });
  };
}

interface MutationConfig<TVars, TData> {
  mutationFn: (vars: TVars) => Promise<TData>;

  successMessage?: string | ((data: TData, vars: TVars) => string);

  errorMessage?: string;

  silentError?: boolean;

  invalidates: (
    vars: TVars,
    data: TData,
  ) => readonly (QueryKey | readonly unknown[])[];
  onSuccess?: (data: TData, vars: TVars) => void;
}

export function createMutationHook<TVars, TData = unknown>(
  config: MutationConfig<TVars, TData>,
) {
  return function useResourceMutation() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: config.mutationFn,
      onSuccess: (data, vars) => {
        if (config.successMessage) {
          toast.success(
            typeof config.successMessage === "function"
              ? config.successMessage(data, vars)
              : config.successMessage,
          );
        }
        for (const key of config.invalidates(vars, data)) {
          qc.invalidateQueries({ queryKey: key as QueryKey });
        }
        config.onSuccess?.(data, vars);
      },
      onError: (err: unknown) => {
        if (config.silentError) return;
        const message = (err as { message?: string })?.message;
        toast.error(message || config.errorMessage || "Terjadi kesalahan");
      },
    });
  };
}
