"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { FulfillmentCardList } from "@/components/dashboard/proses-pesanan/shared/completed-order-card-list";
import {
  DAY_TERMS,
  DAY_TERM_LABEL,
  dayTermDateRange,
  pantauanDetailHref,
  type PantauanColumn,
} from "@/types/proses-pesanan/pantauan-drilldown";

export function PantauanDetailView({
  column,
  dayTerm,
}: {
  column: PantauanColumn;
  dayTerm: number;
}) {
  const baseParams = useMemo(() => dayTermDateRange(dayTerm), [dayTerm]);

  return (
    <LiquidGlass
      radius={24}
      intensity="default"
      className="bg-white/40 dark:bg-white/[0.06]"
    >
      <div className="border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-base font-semibold">{column.label}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Daftar pesanan pada tahap ini berdasarkan umur pesanan.
        </p>
        <div className="mt-3">
          <Tabs value={String(dayTerm)}>
            <TabsList variant="line" className="max-w-full overflow-x-auto">
              {DAY_TERMS.map((term) => (
                <TabsTrigger key={term} value={String(term)} asChild>
                  <Link href={pantauanDetailHref(column.slug, term)}>
                    {DAY_TERM_LABEL[term]}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <FulfillmentCardList
        stage={column.stage}
        baseParams={baseParams}
        filterFields={["courier", "location", "channel", "store"]}
        emptyTitle="Tidak ada pesanan"
        emptyDescription="Belum ada pesanan pada tahap dan periode ini."
        searchPlaceholder="Cari no. pesanan, penerima, resi…"
      />
    </LiquidGlass>
  );
}
