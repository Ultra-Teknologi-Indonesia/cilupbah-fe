"use client";

import * as React from "react";

export function useGlassSpecular<T extends HTMLElement = HTMLDivElement>() {
  const ref = React.useRef<T | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const reducedRef = React.useRef(false);

  React.useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onPointerMove = React.useCallback((e: React.PointerEvent<T>) => {
    if (reducedRef.current || rafRef.current) return;
    const x = e.clientX;
    const y = e.clientY;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--lg-x", `${x - rect.left}px`);
      el.style.setProperty("--lg-y", `${y - rect.top}px`);
      el.style.setProperty("--lg-spec", "1");
    });
  }, []);

  const onPointerLeave = React.useCallback(() => {
    ref.current?.style.setProperty("--lg-spec", "0");
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
