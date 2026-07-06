"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsIcon, UsersIcon, Undo2Icon } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = {
  id: string;
  label: string;
  icon: typeof SettingsIcon;
  href: string;
};

const TABS: Tab[] = [
  {
    id: "umum",
    label: "Umum",
    icon: SettingsIcon,
    href: "/dashboard/pengaturan",
  },
  {
    id: "pengguna",
    label: "Daftar Pengguna",
    icon: UsersIcon,
    href: "/dashboard/pengaturan/pengguna",
  },
  {
    id: "retur",
    label: "Retur Penjualan",
    icon: Undo2Icon,
    href: "/dashboard/pengaturan/retur",
  },
];

function activeId(pathname: string): string {
  if (pathname.startsWith("/dashboard/pengaturan/pengguna")) return "pengguna";
  if (pathname.startsWith("/dashboard/pengaturan/retur")) return "retur";
  return "umum";
}

export function PengaturanTabBar() {
  const pathname = usePathname();
  const active = activeId(pathname);

  return (
    <Tabs value={active}>
      <TabsList variant="glass" className="max-w-full overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              asChild
              className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
            >
              <Link href={tab.href}>
                <Icon />
                {tab.label}
              </Link>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
