"use client";

import { useEffect } from "react";
import { create } from "zustand";

/** Lama tanpa aktivitas sebelum layar dikunci. */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

const CHECK_INTERVAL_MS = 15_000;

/** Jangan menulis localStorage tiap mousemove. */
const ACTIVITY_THROTTLE_MS = 15_000;

export const MAX_UNLOCK_ATTEMPTS = 5;

const LAST_ACTIVITY_KEY = "auth:last-activity";
const LOCKED_KEY = "auth:locked";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "click",
  "scroll",
  "touchstart",
] as const;

type IdleLockState = {
  locked: boolean;
  lock: () => void;
  unlock: () => void;
};

/**
 * Status kunci disimpan di localStorage, bukan hanya state React, supaya
 * seluruh tab ikut terkunci dan ikut terbuka bersamaan. Aktivitas di satu
 * tab juga menahan timer di tab lain.
 */
export const useIdleLockStore = create<IdleLockState>((set) => ({
  locked: false,
  lock: () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCKED_KEY, "1");
    }
    set({ locked: true });
  },
  unlock: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCKED_KEY);
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }
    set({ locked: false });
  },
}));

/**
 * Bersihkan sisa status kunci dari sesi sebelumnya. Wajib dipanggil saat
 * login sukses: tanpa ini, `auth:locked` atau `auth:last-activity` yang basi
 * membuat layar langsung terkunci begitu dashboard ter-mount.
 */
export function resetIdleLock() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCKED_KEY);
  window.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  useIdleLockStore.setState({ locked: false });
}

function readLastActivity(): number {
  const raw = window.localStorage.getItem(LAST_ACTIVITY_KEY);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : Date.now();
}

/**
 * Pantau aktivitas dan kunci layar setelah idle. Dipasang sekali saja di
 * komponen idle lock yang di-mount di root layout.
 */
export function useIdleLock(enabled: boolean) {
  const lock = useIdleLockStore((s) => s.lock);
  const locked = useIdleLockStore((s) => s.locked);

  useEffect(() => {
    if (!enabled) return;

    // Pulihkan status kunci saat tab baru dibuka atau halaman di-reload.
    if (window.localStorage.getItem(LOCKED_KEY) === "1") {
      useIdleLockStore.setState({ locked: true });
    } else if (!window.localStorage.getItem(LAST_ACTIVITY_KEY)) {
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }

    let lastWrite = 0;

    const markActive = () => {
      if (useIdleLockStore.getState().locked) return;
      const now = Date.now();
      if (now - lastWrite < ACTIVITY_THROTTLE_MS) return;
      lastWrite = now;
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    };

    const checkIdle = () => {
      if (useIdleLockStore.getState().locked) return;
      if (Date.now() - readLastActivity() >= IDLE_TIMEOUT_MS) {
        lock();
      }
    };

    const onVisibility = () => {
      // Hanya memeriksa saat tab kembali terlihat. Sengaja TIDAK menandai
      // aktivitas saat tab disembunyikan: pindah ke tab lain bukan aktivitas
      // di aplikasi ini, dan menandainya justru memundurkan waktu kunci.
      //
      // Pemeriksaan di sini wajib karena setInterval tidak berjalan (atau
      // di-throttle berat) saat laptop tidur / tab di latar belakang —
      // tanpa ini, user membuka laptop setelah berjam-jam dan layar tidak
      // terkunci.
      if (document.visibilityState === "visible") checkIdle();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCKED_KEY) {
        useIdleLockStore.setState({ locked: event.newValue === "1" });
      }
    };

    for (const name of ACTIVITY_EVENTS) {
      window.addEventListener(name, markActive, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);

    const timer = window.setInterval(checkIdle, CHECK_INTERVAL_MS);

    return () => {
      for (const name of ACTIVITY_EVENTS) {
        window.removeEventListener(name, markActive);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(timer);
    };
  }, [enabled, lock]);

  return locked;
}
