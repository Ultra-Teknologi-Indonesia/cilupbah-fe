"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import DashboardNavigation from "./nav-main";
import type { NavGroup } from "./nav-data";

const PANEL_WIDTH = 264;
const WIDTH_TRANSITION = { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const };
const CONTENT_TRANSITION = { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const };

export function SidebarPanel({ group, open }: { group: NavGroup; open: boolean }) {
  const reduce = useReducedMotion();
  const [isAnimating, setIsAnimating] = React.useState(false);

  // The outer "spacer" reserves layout width with NO animation, so the main
  // content reflows exactly once per toggle. The inner panel then slides into
  // that space with `transform` only (compositor-driven → 60fps). On close we
  // keep the space reserved until the slide-out finishes, then collapse it.
  const [reserved, setReserved] = React.useState(open);
  // Reserve the moment the panel opens (adjust state during render, the
  // React-recommended pattern — no effect). It's released in onAnimationComplete
  // once the slide-out finishes.
  if (open && !reserved) setReserved(true);

  return (
    <div
      className="hidden h-full overflow-hidden md:block"
      // Instant width change (no transition) — one reflow, not one-per-frame.
      style={{ width: reserved ? PANEL_WIDTH : 0 }}
    >
      <motion.div
        className="glass-elevation h-full overflow-hidden rounded-2xl"
        initial={false}
        animate={{ x: open ? 0 : "-100%", opacity: open ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : WIDTH_TRANSITION}
        style={{ width: PANEL_WIDTH, willChange: isAnimating ? "transform" : "auto" }}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => {
          setIsAnimating(false);
          if (!open) setReserved(false);
        }}
      >
      <div
        className={cn(
          "sidebar-glass liquid-glass-subtle relative flex h-full flex-col rounded-2xl",
          isAnimating && "lg-animating"
        )}
        style={{ width: PANEL_WIDTH }}
      >
        <div className="shrink-0 px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold tracking-tight">{group.title}</h2>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={group.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={reduce ? { duration: 0 } : CONTENT_TRANSITION}
            >
              <DashboardNavigation routes={group.items} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
