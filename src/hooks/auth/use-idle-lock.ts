"use client";

import { useEffect } from "react";
import { create } from "zustand";

export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

const CHECK_INTERVAL_MS = 15_000;

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

export function useIdleLock(enabled: boolean) {
  const lock = useIdleLockStore((s) => s.lock);
  const locked = useIdleLockStore((s) => s.locked);

  useEffect(() => {
    if (!enabled) return;

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
