"use client";

import { SlidersHorizontalIcon, ArrowLeftRightIcon } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlTab } from "@/hooks/use-url-tab";
import { PenyesuaianTab } from "@/components/dashboard/transaksi-stok/penyesuaian-tab";
import { TransferTab } from "@/components/dashboard/transaksi-stok/transfer-tab";

type Tab = "penyesuaian" | "transfer";

const TABS: { key: Tab; label: string; icon: typeof SlidersHorizontalIcon }[] =
  [
    { key: "penyesuaian", label: "Koreksi Stok", icon: SlidersHorizontalIcon },
    { key: "transfer", label: "Internal Transfer", icon: ArrowLeftRightIcon },
  ];

const TAB_KEYS = TABS.map((t) => t.key);

export function TransaksiStokView() {
  const [activeTab, setActiveTab] = useUrlTab<Tab>("tab", "penyesuaian", {
    validValues: TAB_KEYS,
  });

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
        <TabsList variant="glass" className="max-w-full overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
              >
                <Icon />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {activeTab === "penyesuaian" && <PenyesuaianTab />}
      {activeTab === "transfer" && <TransferTab />}
    </>
  );
}
