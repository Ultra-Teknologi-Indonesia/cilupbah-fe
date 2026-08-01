"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleUserRound, ClockIcon, ShieldCheckIcon } from "lucide-react";

import { PageTitle } from "@/components/dashboard/page-title";
import { AppVersion } from "@/components/dashboard/app-version";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AktivitasTab } from "./tabs/aktivitas-tab";
import { KeamananTab } from "./tabs/keamanan-tab";
import { ProfilTab } from "./tabs/profil-tab";

const TABS = [
  { id: "profil", label: "Profil", icon: CircleUserRound },
  { id: "keamanan", label: "Keamanan", icon: ShieldCheckIcon },
  { id: "aktivitas", label: "Sesi & Riwayat", icon: ClockIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTabId(value: string | null): value is TabId {
  return value === "profil" || value === "keamanan" || value === "aktivitas";
}

export function ProfilSayaShell({ version }: { version: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams.get("tab");
  const active: TabId = isTabId(activeParam) ? activeParam : "profil";

  const handleChange = (value: string) => {
    if (!isTabId(value)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`/dashboard/profil-saya?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Profil Saya"
        description="Kelola data pribadi, keamanan akun, dan lihat aktivitas login Anda."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profil Saya" },
        ]}
      />

      <Tabs value={active} onValueChange={handleChange}>
        <TabsList variant="glass" className="max-w-full overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
              >
                <Icon />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="profil" className="mt-6">
          <ProfilTab />
        </TabsContent>
        <TabsContent value="keamanan" className="mt-6">
          <KeamananTab />
        </TabsContent>
        <TabsContent value="aktivitas" className="mt-6">
          <AktivitasTab />
        </TabsContent>
      </Tabs>

      <AppVersion version={version} className="pt-2 pb-4" />
    </div>
  );
}
