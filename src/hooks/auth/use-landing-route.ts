"use client";

import { useVisibleNav } from "@/components/dashboard/sidebar/use-visible-nav";

export function useLandingRoute(): string {
  const { groups } = useVisibleNav();
  return groups[0]?.items[0]?.link ?? "/dashboard/bantuan";
}
