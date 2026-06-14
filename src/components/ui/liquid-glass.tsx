"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "subtle" | "default" | "strong";
  radius?: number;
  showGlow?: boolean;
  showShadow?: boolean;
  /**
   * Pointer-reactive specular highlight (the light "catches" the surface).
   * PERF: defaults to `false`. The effect blends (`mix-blend-mode: soft-light`)
   * over a `backdrop-filter` surface, so each pointer move repaints the blurred
   * backdrop — cheap for one showcase tile, a jank source for a grid of cards.
   * Opt in only on a hero/standalone surface.
   */
  reactive?: boolean;
}

const LiquidGlass = React.forwardRef<HTMLDivElement, LiquidGlassProps>(
  (
    {
      intensity = "default",
      radius = 28,
      showGlow = true,
      showShadow = true,
      reactive = false,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const blurMap = { subtle: 12, default: 18, strong: 28 };
    const saturationMap = { subtle: 1.2, default: 1.5, strong: 1.8 };
    const brightnessMap = { subtle: 1.02, default: 1.05, strong: 1.1 };

    const blur = blurMap[intensity];
    const saturation = saturationMap[intensity];
    const brightness = brightnessMap[intensity];

    const innerRef = React.useRef<HTMLDivElement | null>(null);
    const rafRef = React.useRef<number | null>(null);
    const reducedRef = React.useRef(false);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

    React.useEffect(() => {
      reducedRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, []);

    const handlePointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (reducedRef.current || rafRef.current) return;
        const x = e.clientX;
        const y = e.clientY;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          const el = innerRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--lg-x", `${x - rect.left}px`);
          el.style.setProperty("--lg-y", `${y - rect.top}px`);
          el.style.setProperty("--lg-spec", "1");
        });
      },
      []
    );

    const handlePointerLeave = React.useCallback(() => {
      innerRef.current?.style.setProperty("--lg-spec", "0");
    }, []);

    return (
      <div
        ref={innerRef}
        className={cn("lg-glass", className)}
        onPointerMove={reactive ? handlePointerMove : undefined}
        onPointerLeave={reactive ? handlePointerLeave : undefined}
        style={
          {
            position: "relative",
            borderRadius: radius,
            overflow: "hidden",
            // Consumed by the `.lg-glass` CSS so the `.refraction` variant can
            // extend the backdrop-filter chain with the SVG displacement map.
            "--lg-blur": `${blur}px`,
            "--lg-sat": `${saturation}`,
            "--lg-bright": `${brightness}`,
            filter: showShadow
              ? "drop-shadow(0 8px 32px rgba(0,0,0,0.12)) drop-shadow(0 2px 8px rgba(0,0,0,0.08))"
              : undefined,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {/* Rim light / inner glow */}
        {showGlow && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              borderRadius: radius,
              pointerEvents: "none",
              boxShadow:
                "inset 0 0.5px 0 0 rgba(255,255,255,0.6), inset 0 0 8px 0 rgba(255,255,255,0.25)",
              borderTop: "0.5px solid rgba(255,255,255,0.5)",
              borderLeft: "0.5px solid rgba(255,255,255,0.3)",
            }}
          />
        )}

        {/* Pointer-reactive specular highlight */}
        {reactive && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              borderRadius: radius,
              pointerEvents: "none",
              opacity: "var(--lg-spec, 0)",
              transition: "opacity 0.4s ease-out",
              mixBlendMode: "soft-light",
              background:
                "radial-gradient(220px circle at var(--lg-x, 50%) var(--lg-y, 50%), rgba(255,255,255,0.5), rgba(255,255,255,0) 60%)",
            }}
          />
        )}

        {/* Static diagonal shimmer */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            borderRadius: radius,
            pointerEvents: "none",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
      </div>
    );
  }
);

LiquidGlass.displayName = "LiquidGlass";

export { LiquidGlass };
export type { LiquidGlassProps };
