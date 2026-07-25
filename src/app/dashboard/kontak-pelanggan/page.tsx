"use client";

import { UsersIcon, BadgeCheckIcon, TagIcon } from "lucide-react";

import { PageTitle } from "@/components/dashboard/page-title";
import { PelangganTab } from "@/components/dashboard/kontak-pelanggan/pelanggan-tab";
import { SalesmanTab } from "@/components/dashboard/kontak-pelanggan/salesman-tab";
import { KategoriTab } from "@/components/dashboard/kontak-pelanggan/kategori-tab";
import { useUrlTab } from "@/hooks/use-url-tab";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Tab = "pelanggan" | "salesman" | "kategori";

const TABS: { key: Tab; label: string; icon: typeof UsersIcon }[] = [
  { key: "pelanggan", label: "Pelanggan", icon: UsersIcon },
  { key: "salesman", label: "Salesman", icon: BadgeCheckIcon },
  { key: "kategori", label: "Kategori", icon: TagIcon },
];

const TAB_KEYS = TABS.map((t) => t.key);

export default function KontakPelangganPage() {
  const [activeTab, setActiveTab] = useUrlTab<Tab>("tab", "pelanggan", {
    validValues: TAB_KEYS,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Kontak Pelanggan"
        breadcrumb={[{ label: "Penjualan" }, { label: "Kontak Pelanggan" }]}
      />

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as Tab)}>
        <LiquidGlass
          radius={16}
          intensity="subtle"
          showGlow={false}
          showShadow={false}
          reactive={false}
          className="w-fit max-w-full overflow-x-auto bg-white/50 p-1.5 dark:bg-white/[0.06]"
        >
          <TabsList className="gap-1 bg-transparent">
            {TABS.map(({ key, label, icon: Icon }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
              >
                <Icon />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </LiquidGlass>

        <div className="mt-6">
          <TabsContent value="pelanggan" className="mt-0 outline-none">
            <PelangganTab />
          </TabsContent>
          <TabsContent value="salesman" className="mt-0 outline-none">
            <SalesmanTab />
          </TabsContent>
          <TabsContent value="kategori" className="mt-0 outline-none">
            <KategoriTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
