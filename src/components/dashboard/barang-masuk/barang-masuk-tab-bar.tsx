"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Undo2Icon, PackageIcon, LayersIcon } from "lucide-react";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = {
  id: string;
  label: string;
  icon: typeof PackageIcon;
  href?: string;
};

const TABS: Tab[] = [
  {
    id: "penerimaan",
    label: "Penerimaan Barang",
    icon: PackageIcon,
    href: "/dashboard/barang-masuk/penerimaan",
  },
  {
    id: "penempatan",
    label: "Penempatan Barang",
    icon: LayersIcon,
    href: "/dashboard/barang-masuk/penempatan",
  },
  {
    id: "retur",
    label: "Retur dari Channel Online",
    icon: Undo2Icon,
    href: "/dashboard/barang-masuk/retur",
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

  return (
    <LiquidGlass
      radius={16}
      intensity="subtle"
      showGlow={false}
      showShadow={false}
      reactive={false}
      className="w-fit max-w-full overflow-x-auto bg-white/50 p-1.5 dark:bg-white/[0.06]"
    >
      <Tabs value={active}>
        <TabsList className="gap-1 bg-transparent">
          {TABS.map((tab) => {
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
    </LiquidGlass>
  );
}
