"use client";

import { UsersIcon, BadgeCheckIcon, TagIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/page-title";
import { PelangganTab } from "@/components/dashboard/kontak-pelanggan/pelanggan-tab";
import { SalesmanTab } from "@/components/dashboard/kontak-pelanggan/salesman-tab";
import { KategoriTab } from "@/components/dashboard/kontak-pelanggan/kategori-tab";
import { useUrlTab } from "@/hooks/use-url-tab";
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
      <TabsList className="h-auto w-full justify-start gap-1 bg-transparent p-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <TabsTrigger
            key={key}
            value={key}
            className="inline-flex h-auto items-center gap-1.5 rounded-full bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=active]:bg-foreground! data-[state=active]:text-background! data-[state=active]:shadow-sm! after:hidden!"
          >
            <Icon className="h-4 w-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

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
