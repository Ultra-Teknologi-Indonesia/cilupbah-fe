"use client";

import { useEffect } from "react";

/**
 * Mounts the SVG displacement filter used for *real* backdrop refraction and
 * enables it only on Chromium engines, where `backdrop-filter: url(#...)` with
 * feDisplacementMap actually renders. Safari/Firefox keep the lighter blur+rim
 * glass (graceful fallback), so there is zero compatibility risk.
 *
 * Mount once near the app root.
 */
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

  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter
          id="liquid-glass-refraction"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          {/* Smooth low-frequency noise → gentle, glass-like warping (not grain). */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.013"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2.2" result="softNoise" />
          {/* Refract the backdrop (SourceGraphic) by the noise field. */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale="16"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
