"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuItem as SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";

export type SubRoute = {
  title: string;
  link: string;
  badge?: string | number;
  subs?: {
    title: string;
    link: string;
  }[];
};

export type Route = {
  id: string;
  title: string;
  icon?: React.ElementType;
  link: string;
  subs?: SubRoute[];
};

const SUB_MENU_TRANSITION = {
  type: "tween" as const,
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as readonly [number, number, number, number],
};

export default function DashboardNavigation({ routes }: { routes: Route[] }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const pathname = usePathname();

  const isRouteActive = (route: Route) => {
    if (pathname === route.link) return true;
    if (route.subs) {
      return route.subs.some((sub) => {
        if (pathname === sub.link) return true;
        if (sub.subs) {
          return sub.subs.some((nestedSub) => pathname === nestedSub.link);
        }
        return false;
      });
    }
    return false;
  };

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      {routes.map((route) => {
        const isActive = isRouteActive(route);
        const isOpen = !isCollapsed && (openCollapsible === route.id || isActive);
        const hasSubRoutes = !!route.subs?.length;
        const Icon = route.icon;

        return (
          <SidebarMenuItem key={route.id}>
            {hasSubRoutes ? (
              <div className="w-full group-data-[collapsible=icon]:w-auto">
                <SidebarMenuButton
                  tooltip={route.title}
                  isActive={isActive}
                  onClick={() =>
                    setOpenCollapsible(isOpen ? null : route.id)
                  }
                >
                  {Icon && (
                    <Icon fill={isActive ? "currentColor" : "none"} />
                  )}
                  {!isCollapsed && (
                    <>
                      <span>{route.title}</span>
                      <motion.span
                        className="ml-auto"
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                      >
                        <ChevronRight />
                      </motion.span>
                    </>
                  )}
                </SidebarMenuButton>

                <AnimatePresence initial={false}>
                  {isOpen && !isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={SUB_MENU_TRANSITION}
                      style={{ overflow: "hidden" }}
                    >
                      <SidebarMenuSub className="my-1 ml-3.5 border-sidebar-border">
                        {route.subs?.map((subRoute) => (
                          <div key={`${route.id}-${subRoute.title}`}>
                            <SidebarMenuSubItem className="h-auto">
                              <SidebarMenuSubButton asChild>
                                <Link
                                  href={subRoute.link}
                                  prefetch={true}
                                  className={cn(
                                    "flex items-center justify-between rounded-md px-4 py-1.5 text-sm",
                                    pathname === subRoute.link
                                      ? "bg-sidebar-accent text-foreground font-medium"
                                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                                  )}
                                >
                                  <span>{subRoute.title}</span>
                                  {subRoute.badge && (
                                    <span className="flex h-5 items-center justify-center rounded-full bg-primary/10 px-2 text-[10px] font-medium text-primary">
                                      {subRoute.badge}
                                    </span>
                                  )}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>

                            {subRoute.subs && subRoute.subs.length > 0 && (
                              <div className="ml-4 mt-1 border-l border-sidebar-border pl-2 flex flex-col gap-1">
                                {subRoute.subs.map((nestedSub) => (
                                  <SidebarMenuSubItem key={`${route.id}-${subRoute.title}-${nestedSub.title}`} className="h-auto">
                                    <SidebarMenuSubButton asChild>
                                      <Link
                                        href={nestedSub.link}
                                        prefetch={true}
                                        className={cn(
                                          "flex items-center rounded-md px-4 py-1 text-xs",
                                          pathname === nestedSub.link
                                            ? "bg-sidebar-accent text-foreground font-medium"
                                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                                        )}
                                      >
                                        <span>{nestedSub.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </SidebarMenuSub>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <SidebarMenuButton tooltip={route.title} isActive={isActive} asChild>
                <Link
                  href={route.link}
                  prefetch={true}
                >
                  {Icon && (
                    <Icon fill={isActive ? "currentColor" : "none"} />
                  )}
                  {!isCollapsed && <span>{route.title}</span>}
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
