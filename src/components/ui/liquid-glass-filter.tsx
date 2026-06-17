"use client";

import { useEffect } from "react";

export function LiquidGlassFilter() {
  useEffect(() => {
    const brands = (
      navigator as Navigator & {
        userAgentData?: { brands?: { brand: string }[] };
      }
    ).userAgentData?.brands;
    const isChromium = brands?.some((b) => b.brand === "Chromium");
    if (isChromium) {
      document.documentElement.classList.add("refraction");
    }
  }, []);

  // Filter SVG refraction (feTurbulence + feDisplacementMap) dihapus: itu
  // backdrop-filter termahal dan di-repaint terus selama sidebar terlihat,
  // membuat seluruh app terasa berat di Chrome. Class `refraction` tetap
  // disuntik agar blur kaca sidebar (di globals.css) aktif tanpa displacement.
  return null;
}
