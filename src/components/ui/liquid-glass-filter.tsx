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

  return null;
}
