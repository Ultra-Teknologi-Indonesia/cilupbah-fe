"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArchiveIcon,
  CloudDownloadIcon,
  CombineIcon,
  ImportIcon,
  Package2Icon,
  RocketIcon,
  UploadCloudIcon,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = {
  id: string;
  label: string;
  icon: typeof Package2Icon;
  href?: string;
};

const TABS: Tab[] = [
  {
    id: "master",
    label: "Master",
    icon: Package2Icon,
    href: "/dashboard/produk/master",
  },
  {
    id: "gabung",
    label: "Gabung",
    icon: CombineIcon,
    href: "/dashboard/produk/gabung",
  },
  {
    id: "upload",
    label: "Upload",
    icon: UploadCloudIcon,
    href: "/dashboard/produk/upload",
  },
  {
    id: "download",
    label: "Download",
    icon: CloudDownloadIcon,
    href: "/dashboard/produk/download",
  },
  {
    id: "import",
    label: "Import",
    icon: ImportIcon,
    href: "/dashboard/produk/import",
  },
  {
    id: "arsip",
    label: "Arsip",
    icon: ArchiveIcon,
    href: "/dashboard/produk/arsip",
  },
  {
    id: "naikkan",
    label: "Naikkan Produk",
    icon: RocketIcon,
    href: "/dashboard/produk/naikkan",
  },
];

function activeId(pathname: string, _status: string | null): string {
  if (pathname.startsWith("/dashboard/produk/naikkan")) return "naikkan";
  if (pathname.startsWith("/dashboard/produk/arsip")) return "arsip";
  if (pathname.startsWith("/dashboard/produk/upload")) return "upload";
  if (pathname.startsWith("/dashboard/produk/download")) return "download";
  if (pathname.startsWith("/dashboard/produk/import")) return "import";
  if (pathname.startsWith("/dashboard/produk/gabung")) return "gabung";
  if (pathname.startsWith("/dashboard/produk/master")) return "master";
  return "";
}

export function ProdukTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = activeId(pathname, searchParams.get("status"));

  return (
    <Tabs value={active}>
      <TabsList variant="glass" className="max-w-full overflow-x-auto">
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
  );
}
