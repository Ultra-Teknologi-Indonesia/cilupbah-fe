"use client";

import * as React from "react";

export interface QtyBumpQueueOptions {

  retries?: number;

  retryDelayMs?: number;

  onGiveUp?: (itemId: string) => void;
}

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
          targetRef.current.delete(itemId);
          optionsRef.current?.onGiveUp?.(itemId);
          break;
        }

        if (targetRef.current.get(itemId) === target) {
          targetRef.current.delete(itemId);
          break;
        }
      }
    } finally {
      inflightRef.current.delete(itemId);
    }
  }, []);

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
