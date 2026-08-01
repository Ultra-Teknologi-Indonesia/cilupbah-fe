import { keepPreviousData } from "@tanstack/react-query";

/**
 * Tier kesegaran data React Query (lihat AGENTS.md §2).
 *
 * Pilih tier sesuai risiko "data basi", bukan set staleTime per-file sembarangan:
 * - STATIC  → data referensi yang jarang berubah (master, kategori, filter, lokasi).
 * - DEFAULT → baseline mayoritas list/detail transaksional.
 * - LIVE    → data yang wajib mencerminkan DB terbaru (stok, monitor, antrean).
 *
 * Prinsip: fresh saat DIBUTUHKAN, bukan fetch terus-menerus. Invalidation di
 * mutation (createMutationHook.invalidates / invalidateStockViews) tetap jadi
 * mekanisme utama untuk perubahan yang dilakukan user sendiri.
 */

export const STALE_STATIC = 5 * 60_000;
export const STALE_DEFAULT = 30_000;
export const STALE_LIVE = 0;

/** Interval polling untuk halaman live yang ditonton lama (mis. Monitor Stok). */
export const REFETCH_LIVE = 20_000;

/**
 * Selalu segar saat halaman dibuka atau tab difokuskan kembali, tanpa polling
 * latar belakang. Cocok untuk view "sumber kebenaran" yang dikunjungi on-demand
 * (Posisi Stok, alokasi sumber stok) — akurat tanpa membebani server terus-menerus.
 */
export const freshOnViewOptions = {
  staleTime: STALE_LIVE,
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
  placeholderData: keepPreviousData,
} as const;

/**
 * Fresh-on-view + polling ringan. Untuk dashboard yang ditonton lama sehingga
 * perubahan dari aktor lain (staff lain, webhook channel, job async) ikut muncul.
 * refetchIntervalInBackground:false → berhenti saat tab tidak aktif (hemat).
 */
export const liveQueryOptions = {
  ...freshOnViewOptions,
  refetchInterval: REFETCH_LIVE,
  refetchIntervalInBackground: false,
} as const;
