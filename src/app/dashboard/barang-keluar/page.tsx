"use client";

import { Suspense } from "react";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTitle } from "@/components/dashboard/page-title";
import { TableSkeleton } from "@/components/ui/page-skeleton";
import { ReturPembelianTab } from "@/components/dashboard/barang-keluar/retur-pembelian-tab";
import { TransferKeluarTab } from "@/components/dashboard/barang-keluar/transfer-keluar-tab";
import { useUrlTab } from "@/hooks/use-url-tab";

type OutboundTab = "retur" | "transfer";

const TABS: { key: OutboundTab; label: string }[] = [
  { key: "retur", label: "Retur Pembelian" },
  { key: "transfer", label: "Transfer Keluar" },
];

const TAB_KEYS = TABS.map((t) => t.key);

export default function BarangKeluarPage() {
  const [tab, handleTabChange] = useUrlTab<OutboundTab>("tab", "retur", {
    validValues: TAB_KEYS,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Barang Keluar"
        description="Kelola pengeluaran barang untuk retur pembelian dan transfer antar lokasi."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Keluar" },
        ]}
      />

      <Tabs value={tab} onValueChange={(val) => handleTabChange(val as any)} className="flex flex-col gap-4">
        <LiquidGlass
          radius={16}
          intensity="subtle"
          showGlow={false}
          showShadow={false}
          reactive={false}
          className="w-fit max-w-full overflow-x-auto bg-white/50 p-1.5 dark:bg-white/[0.06]"
        >
          <TabsList className="gap-1 bg-transparent">
            {TABS.map(({ key, label }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </LiquidGlass>

        <TabsContent value="retur" className="mt-0 outline-none">
          <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
            <ReturPembelianTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="transfer" className="mt-0 outline-none">
          <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
            <TransferKeluarTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
