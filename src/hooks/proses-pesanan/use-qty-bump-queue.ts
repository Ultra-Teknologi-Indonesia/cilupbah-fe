"use client";

import * as React from "react";

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
 *
 * `commit(itemId, absoluteQty)` performs the actual mutation (returns a promise).
 * Optimistic UI + rollback are expected to live inside `commit` (e.g. the
 * mutation's own `onMutate`/`onError`).
 */
export function useQtyBumpQueue(
  commit: (itemId: string, absoluteQty: number) => Promise<unknown>,
) {
  const commitRef = React.useRef(commit);
  React.useEffect(() => {
    commitRef.current = commit;
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
        try {
          await commitRef.current(itemId, target);
        } catch {
          // Commit rejected: drop the local target so the next bump re-seeds
          // from the server truth (the mutation rolls its own optimistic state
          // back on error).
          targetRef.current.delete(itemId);
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

  /** Set an item's target to an absolute value (manual row entry). */
  const setTarget = React.useCallback(
    ({
      itemId,
      value,
      max,
      min = 0,
    }: {
      itemId: string;
      value: number;
      max: number;
      min?: number;
    }): number => {
      const next = Math.max(min, Math.min(max, value));
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

  return { bump, setTarget, reset };
}
