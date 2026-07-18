"use client";

import * as React from "react";

export interface ScanDeltaQueueOptions {
  /**
   * Dipanggil saat sebuah penambahan hasil scan gagal tersimpan. Tidak ada
   * tombol retry manual di UI scan (picker hanya berinteraksi dengan scanner),
   * jadi ini satu-satunya sinyal bahwa barang yang sudah diambil fisik belum
   * tercatat — tampilkan dengan keras (toast/suara), jangan diam.
   */
  onGiveUp?: (itemId: string, lostQty: number) => void;
}

/**
 * Antrean penambahan (delta) untuk alur scan picking.
 *
 * Berbeda dari useQtyBumpQueue yang mengirim qty ABSOLUT (masih dipakai packing),
 * hook ini mengirim PENAMBAHAN RELATIF. Server yang menghitung total di dalam row
 * lock, sehingga beberapa orang boleh menggarap picklist yang sama sekaligus
 * tanpa saling menimpa.
 *
 * Jaminan:
 * - Maksimal satu commit in-flight per item (berurutan).
 * - Scan cepat saat ada commit berjalan diakumulasi, lalu dikirim sebagai satu
 *   delta gabungan — 10 scan cepat menjadi ~1-2 request.
 * - Total yang terkirim selalu sama dengan total scan yang dilakukan.
 *
 * SENGAJA TANPA RETRY OTOMATIS. Pada kontrak absolut, mengulang request bersifat
 * idempoten. Pada kontrak delta tidak: kalau request pertama sebenarnya berhasil
 * tapi responsnya hilang di jaringan, retry akan menambah stok terpotong dua kali
 * — persis kelas bug yang sedang kita berantas. Gagal-lalu-lapor (picker scan
 * ulang) itu terlihat dan bisa dikoreksi; dobel-potong itu diam dan merusak data.
 *
 * Kalau nanti retry otomatis benar-benar dibutuhkan, tambahkan idempotency key
 * per scan di BE (mis. kolom unik scan_id di picklist_item_allocations), jangan
 * sekadar mengulang request.
 */
export function useScanDeltaQueue(
  commit: (itemId: string, deltaQty: number) => Promise<unknown>,
  options?: ScanDeltaQueueOptions,
) {
  const commitRef = React.useRef(commit);
  React.useEffect(() => {
    commitRef.current = commit;
  });

  const optionsRef = React.useRef(options);
  React.useEffect(() => {
    optionsRef.current = options;
  });

  const pendingRef = React.useRef<Map<string, number>>(new Map());
  const inflightRef = React.useRef<Set<string>>(new Set());

  const flush = React.useCallback(async (itemId: string) => {
    if (inflightRef.current.has(itemId)) return;
    inflightRef.current.add(itemId);
    try {
      for (;;) {
        const pending = pendingRef.current.get(itemId) ?? 0;
        if (pending <= 0) {
          pendingRef.current.delete(itemId);
          break;
        }

        // Diambil sebelum request supaya scan yang datang selagi request
        // berjalan terakumulasi untuk putaran berikutnya, bukan hilang.
        pendingRef.current.set(itemId, 0);

        try {
          await commitRef.current(itemId, pending);
        } catch {
          pendingRef.current.delete(itemId);
          optionsRef.current?.onGiveUp?.(itemId, pending);
          break;
        }
      }
    } finally {
      inflightRef.current.delete(itemId);
    }
  }, []);

  /** Tambahkan hasil scan ke antrean item. */
  const bump = React.useCallback(
    ({ itemId, delta = 1 }: { itemId: string; delta?: number }): void => {
      pendingRef.current.set(itemId, (pendingRef.current.get(itemId) ?? 0) + delta);
      void flush(itemId);
    },
    [flush],
  );

  const reset = React.useCallback(() => {
    pendingRef.current.clear();
    inflightRef.current.clear();
  }, []);

  return { bump, reset };
}
