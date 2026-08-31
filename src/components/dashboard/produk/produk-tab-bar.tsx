"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArchiveIcon,
  CloudDownloadIcon,
  ImportIcon,
  Package2Icon,
  RocketIcon,
  UploadCloudIcon,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/auth/use-permissions";

type Tab = {
  id: string;
  label: string;
  icon: typeof Package2Icon;
  href?: string;
  permission: string;
};

const TABS: Tab[] = [
  {
    id: "master",
    label: "Master",
    icon: Package2Icon,
    href: "/dashboard/produk/master",
    permission: "view-produk",
  },
  {
    id: "upload",
    label: "Upload",
    icon: UploadCloudIcon,
    href: "/dashboard/produk/upload",
    permission: "create-produk-naik",
  },
  {
    id: "download",
    label: "Download",
    icon: CloudDownloadIcon,
    href: "/dashboard/produk/download",
    permission: "view-produk",
  },
  {
    id: "import",
    label: "Import",
    icon: ImportIcon,
    href: "/dashboard/produk/import",
    permission: "import-produk",
  },
  {
    id: "arsip",
    label: "Arsip",
    icon: ArchiveIcon,
    href: "/dashboard/produk/arsip",
    permission: "view-produk",
  },
  {
    id: "naikkan",
    label: "Naikkan Produk",
    icon: RocketIcon,
    href: "/dashboard/produk/naikkan",
    permission: "view-produk-naik",
  },
];

function activeId(pathname: string, _status: string | null): string {
  if (pathname.startsWith("/dashboard/produk/naikkan")) return "naikkan";
  if (pathname.startsWith("/dashboard/produk/arsip")) return "arsip";
  if (pathname.startsWith("/dashboard/produk/upload")) return "upload";
  if (pathname.startsWith("/dashboard/produk/download")) return "download";
  if (pathname.startsWith("/dashboard/produk/import")) return "import";
  if (pathname.startsWith("/dashboard/produk/master")) return "master";
  return "";
}

export function ProdukTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = activeId(pathname, searchParams.get("status"));
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
