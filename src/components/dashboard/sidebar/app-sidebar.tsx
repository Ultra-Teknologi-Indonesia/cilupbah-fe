"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { useSidebar } from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SidebarRailNav } from "./sidebar-rail-nav";
import { SidebarPanel } from "./sidebar-panel";
import DashboardNavigation from "./nav-main";
import { dashboardGroups, findGroupIdForPath, isLeafGroup } from "./nav-data";

export function DashboardSidebar() {
  const { open, toggleSidebar, isMobile, openMobile, setOpenMobile } =
    useSidebar();
  const pathname = usePathname();

  const [activeGroupId, setActiveGroupId] = React.useState(() =>
    findGroupIdForPath(pathname, dashboardGroups)
  );

  const [prevPath, setPrevPath] = React.useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setActiveGroupId(findGroupIdForPath(pathname, dashboardGroups));
  }

  const activeGroup =
    dashboardGroups.find((g) => g.id === activeGroupId) ?? dashboardGroups[0];

  const PRODUK_PREFIXES = [
    "/dashboard/master-produk",
    "/dashboard/produk",
    "/dashboard/listing-marketplace",
  ];
  const isProdukWorkspace = PRODUK_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const handleSelect = React.useCallback(
    (id: string) => {
      setActiveGroupId(id);
      const group = dashboardGroups.find((g) => g.id === id);

      if (group && !isLeafGroup(group) && !open) toggleSidebar();
    },
    [open, toggleSidebar]
  );

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-[300px] bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu navigasi</SheetTitle>
            <SheetDescription>Daftar menu dashboard</SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col overflow-y-auto px-2 py-4">
            {dashboardGroups.map((group) => (
              <div key={group.id} className="py-2">
                {group.zone !== "top" && (
                  <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </div>
                )}
                <DashboardNavigation routes={group.items} />
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="relative z-10 hidden h-dvh shrink-0 md:flex md:gap-2 md:p-3 md:pr-0">
      <SidebarRailNav
        activeGroupId={activeGroupId}
        onSelect={handleSelect}
        onTogglePanel={toggleSidebar}
      />

      <SidebarPanel
        group={activeGroup}
        open={open && !isLeafGroup(activeGroup) && !(isProdukWorkspace && activeGroupId === "katalog")}
      />
    </div>
  );
}
