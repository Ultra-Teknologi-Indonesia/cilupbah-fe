"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Undo2Icon, PackageIcon, LayersIcon } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/auth/use-permissions";

type Tab = {
  id: string;
  label: string;
  icon: typeof PackageIcon;
  href?: string;
  permission: string;
};

const TABS: Tab[] = [
  {
    id: "penerimaan",
    label: "Penerimaan Barang",
    icon: PackageIcon,
    href: "/dashboard/barang-masuk/penerimaan",
    permission: "view-barang-masuk",
  },
  {
    id: "penempatan",
    label: "Penempatan Barang",
    icon: LayersIcon,
    href: "/dashboard/barang-masuk/penempatan",
    permission: "view-penempatan",
  },
  {
    id: "retur",
    label: "Retur dari Channel Online",
    icon: Undo2Icon,
    href: "/dashboard/barang-masuk/retur",
    permission: "view-retur-penjualan",
  },
];

function activeId(pathname: string): string {
  if (pathname.startsWith("/dashboard/barang-masuk/retur")) return "retur";
  if (pathname.startsWith("/dashboard/barang-masuk/penempatan"))
    return "penempatan";

  return "penerimaan";
}

export function BarangMasukTabBar() {
  const pathname = usePathname();
  const active = activeId(pathname);
  const { can } = usePermissions();

  return (
    <Tabs value={active}>
      <TabsList variant="glass" className="max-w-full overflow-x-auto">
        {TABS.filter((tab) => can(tab.permission)).map((tab) => {
          const Icon = tab.icon;

          if (!tab.href) {
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled
                title="Segera hadir"
                className="text-muted-foreground/60"
              >
                <Icon />
                {tab.label}
                <span className="rounded bg-muted px-1 py-0.5 text-2xs font-medium text-muted-foreground">
                  Segera
                </span>
              </TabsTrigger>
            );
          }

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
