"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import DashboardNavigation from "./nav-main";
import type { NavGroup } from "./nav-data";

const PANEL_WIDTH = 264;
const PANEL_TRANSITION = { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const };
const CONTENT_TRANSITION = { duration: 0.16, ease: [0.4, 0, 0.2, 1] as const };

export function SidebarPanel({
  group,
  open,
}: {
  group: NavGroup;
  open: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute left-[88px] top-[72px] z-50 hidden md:block">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            className="glass-elevation sidebar-glass liquid-glass-subtle bg-sidebar pointer-events-auto flex max-h-[calc(100dvh-88px)] origin-top-left flex-col overflow-hidden rounded-2xl"
            style={{ width: PANEL_WIDTH }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={reduce ? { duration: 0 } : PANEL_TRANSITION}
          >
            <div className="shrink-0 px-4 pt-4 pb-2">
              <h2 className="text-sm font-semibold tracking-tight">
                {group.title}
              </h2>
            </div>

            <div className="no-scrollbar min-h-0 overflow-y-auto px-2 pb-3">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
