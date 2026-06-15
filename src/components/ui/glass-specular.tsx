import * as React from "react";

export function GlassSpecular({ size = 200 }: { size?: number }) {
  return (
    <div
      aria-hidden="true"
      data-glass-specular=""
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: "var(--lg-spec, 0)",
        transition: "opacity 0.4s ease-out",
        mixBlendMode: "soft-light",
        background: `radial-gradient(${size}px circle at var(--lg-x, 50%) var(--lg-y, 50%), rgba(255,255,255,0.4), rgba(255,255,255,0) 60%)`,
      }}
    />
  );
}
