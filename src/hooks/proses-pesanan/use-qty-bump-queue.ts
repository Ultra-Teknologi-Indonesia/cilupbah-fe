"use client";

import * as React from "react";

export interface QtyBumpQueueOptions {
  /** Extra attempts after the first, on top of the initial try. Default 2 (3 tries total). */
  retries?: number;
  /** Base backoff between retries in ms, scaled by attempt number. Default 600. */
  retryDelayMs?: number;
  /**
   * Called once a target's commit fails on every attempt and the queue gives
   * up on it. There is no manual "retry" affordance in the scan UI by design
   * (checkers only interact with the scanner) — this is the sole signal that
   * a physically-scanned unit did not actually persist, so the caller should
   * surface it loudly (toast/alert) rather than fail silently.
   */
  onGiveUp?: (itemId: string) => void;
}

/**
 * Serialized, coalescing qty committer for scan-to-increment flows.
 *
 * Scan-based warehouse UIs (picking/packing) fire many rapid "+1" events. The
 * underlying mutations send an ABSOLUTE qty, so naive per-scan mutations can
 * commit out-of-order and clobber the final value. This queue guarantees:
 *
 * - At most one in-flight commit per item (serialized).
 * - Rapid scans while a commit is in flight are coalesced into one follow-up
 *   commit carrying the latest target — 10 fast scans collapse to ~1-2 calls.
 * - The final committed value always equals the last requested target.
 * - A commit that fails (e.g. transient network drop) is retried with
 *   backoff before giving up — scanning is the only interaction the checker
 *   has, so transient failures must self-heal without a manual retry step.
 *
 * `commit(itemId, absoluteQty)` performs the actual mutation (returns a promise).
 * Optimistic UI + rollback are expected to live inside `commit` (e.g. the
 * mutation's own `onMutate`/`onError`).
 */
export function useQtyBumpQueue(
  commit: (itemId: string, absoluteQty: number) => Promise<unknown>,
  options?: QtyBumpQueueOptions,
) {
  const commitRef = React.useRef(commit);
  React.useEffect(() => {
    commitRef.current = commit;
  });

  const optionsRef = React.useRef(options);
  React.useEffect(() => {
    optionsRef.current = options;
  });

  const targetRef = React.useRef<Map<string, number>>(new Map());
  const inflightRef = React.useRef<Set<string>>(new Set());

  const flush = React.useCallback(async (itemId: string) => {
    if (inflightRef.current.has(itemId)) return;
    inflightRef.current.add(itemId);
    try {
      // Keep committing until the target stops changing mid-flight.
      for (;;) {
        const target = targetRef.current.get(itemId);
        if (target === undefined) break;

        const retries = optionsRef.current?.retries ?? 2;
        const retryDelayMs = optionsRef.current?.retryDelayMs ?? 600;
        let committed = false;

        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            await commitRef.current(itemId, target);
            committed = true;
            break;
          } catch {
            if (attempt < retries) {
              await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
            }
          }
        }

        if (!committed) {
          // Every attempt failed: drop the local target so the next bump
          // re-seeds from server truth (the mutation rolls its own
          // optimistic state back on error), and surface it — this is the
          // only failure signal available since there's no manual retry UI.
          targetRef.current.delete(itemId);
          optionsRef.current?.onGiveUp?.(itemId);
          break;
        }

        // Only clear if no newer scan arrived while this commit was in flight.
        if (targetRef.current.get(itemId) === target) {
          targetRef.current.delete(itemId);
          break;
        }
      }
    } finally {
      inflightRef.current.delete(itemId);
    }
  }, []);

  /**
   * Increment (or decrement) an item's target qty by `delta`, clamped to
   * `[0, max]`, seeding from `base` (the server's current qty) when no target
   * is pending. Returns the new target, or `null` if already capped.
   */
  const bump = React.useCallback(
    ({
      itemId,
      base,
      max,
      delta = 1,
    }: {
      itemId: string;
      base: number;
      max: number;
      delta?: number;
    }): number | null => {
      const cur = targetRef.current.get(itemId) ?? base;
      const next = Math.max(0, Math.min(max, cur + delta));
      if (next === cur) return null;
      targetRef.current.set(itemId, next);
      void flush(itemId);
      return next;
    },
    [flush],
  );

  const reset = React.useCallback(() => {
    targetRef.current.clear();
    inflightRef.current.clear();
  }, []);

  return { bump, reset };
}
