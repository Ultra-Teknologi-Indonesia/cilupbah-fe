"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SettingsIcon,
  UsersIcon,
  ShieldCheckIcon,
  BoxesIcon,
  ArrowLeftRightIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

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
    id: "peran",
    label: "Peran & Hak Akses",
    icon: ShieldCheckIcon,
    href: "/dashboard/pengaturan/peran",
  },
  {
    id: "alokasi-stok",
    label: "Alokasi Stok & Channel",
    icon: BoxesIcon,
    href: "/dashboard/pengaturan/alokasi-stok",
  },
  {
    id: "persediaan",
    label: "Persediaan",
    icon: SlidersHorizontalIcon,
    href: "/dashboard/pengaturan/persediaan",
  },
  {
    id: "aktivitas-impex",
    label: "Aktivitas Import dan Export",
    icon: ArrowLeftRightIcon,
    href: "/dashboard/aktivitas-impex",
  },
];

function activeId(pathname: string): string {
  if (pathname.startsWith("/dashboard/pengaturan/pengguna")) return "pengguna";
  if (pathname.startsWith("/dashboard/pengaturan/peran")) return "peran";
  if (pathname.startsWith("/dashboard/pengaturan/alokasi-stok"))
    return "alokasi-stok";
  if (pathname.startsWith("/dashboard/pengaturan/persediaan"))
    return "persediaan";
  if (pathname.startsWith("/dashboard/aktivitas-impex"))
    return "aktivitas-impex";
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
