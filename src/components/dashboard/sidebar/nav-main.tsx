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
import type React from "react";
import { useState } from "react";

export type Route = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  link: string;
  subs?: {
    title: string;
    link: string;
    icon?: React.ReactNode;
  }[];
};

const SUB_MENU_TRANSITION = {
  type: "tween" as const,
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as readonly [number, number, number, number],
};

export default function DashboardNavigation({ routes }: { routes: Route[] }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

  return (
    <SidebarMenu>
      {routes.map((route) => {
        const isOpen = !isCollapsed && openCollapsible === route.id;
        const hasSubRoutes = !!route.subs?.length;

        return (
          <SidebarMenuItem key={route.id}>
            {hasSubRoutes ? (
              <div className="w-full">
                <SidebarMenuButton
                  onClick={() =>
                    setOpenCollapsible(isOpen ? null : route.id)
                  }
                  className={cn(
                    "flex w-full items-center rounded-lg px-2",
                    isOpen
                      ? "bg-sidebar-muted text-foreground"
                      : "text-muted-foreground hover:bg-sidebar-muted hover:text-foreground",
                    isCollapsed && "justify-center"
                  )}
                >
                  {route.icon}
                  {!isCollapsed && (
                    <span className="ml-2 flex-1 text-sm font-medium">
                      {route.title}
                    </span>
                  )}
                  {!isCollapsed && hasSubRoutes && (
                    <motion.span
                      className="ml-auto"
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                    >
                      <ChevronRight className="size-4" />
                    </motion.span>
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
                      <SidebarMenuSub className="my-1 ml-3.5 ">
                        {route.subs?.map((subRoute) => (
                          <SidebarMenuSubItem
                            key={`${route.id}-${subRoute.title}`}
                            className="h-auto"
                          >
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={subRoute.link}
                                prefetch={true}
                                className="flex items-center rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-muted hover:text-foreground"
                              >
                                {subRoute.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <SidebarMenuButton tooltip={route.title} asChild>
                <Link
                  href={route.link}
                  prefetch={true}
                  className={cn(
                    "flex items-center rounded-lg px-2 transition-colors text-muted-foreground hover:bg-sidebar-muted hover:text-foreground",
                    isCollapsed && "justify-center"
                  )}
                >
                  {route.icon}
                  {!isCollapsed && (
                    <span className="ml-2 text-sm font-medium">
                      {route.title}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
