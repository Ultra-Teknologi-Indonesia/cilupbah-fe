"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, SettingsIcon, LogOutIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthService } from "@/services/auth/auth.service";
import { Logo } from "./logo";
import { NotificationsPopover } from "./nav-notifications";
import {
  dashboardGroups,
  settingsRoutes,
  sampleNotifications,
  isLeafGroup,
  type NavGroup,
  type NavZone,
} from "./nav-data";
import type { Route } from "./nav-main";

const ZONES: NavZone[] = ["top", "ops", "fin"];

function RailDivider() {
  return <div className="my-1.5 h-px w-7 bg-sidebar-border" />;
}

function RailItem({
  group,
  active,
  onSelect,
}: {
  group: NavGroup;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = group.icon;
  const inner = (
    <span
      className={cn(
        "grid size-10 place-items-center rounded-xl transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      )}
    >
      <Icon className="size-5" />
    </span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {isLeafGroup(group) ? (
          <Link
            href={group.items[0].link}
                       aria-label={group.title}
            onClick={() => onSelect(group.id)}
          >
            {inner}
          </Link>
        ) : (
          <button
            type="button"
            aria-label={group.title}
            aria-pressed={active}
            onClick={() => onSelect(group.id)}
          >
            {inner}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="right">{group.title}</TooltipContent>
    </Tooltip>
  );
}

function RailLink({ route, active }: { route: Route; active?: boolean }) {
  const Icon = route.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={route.link}
                   aria-label={route.title}
          className={cn(
            "grid size-10 place-items-center rounded-xl transition-colors",
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          )}
        >
          {Icon && <Icon className="size-5" />}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{route.title}</TooltipContent>
    </Tooltip>
  );
}

export function SidebarRailNav({
  activeGroupId,
  onSelect,
  onTogglePanel,
}: {
  activeGroupId: string;
  onSelect: (id: string) => void;
  onTogglePanel: () => void;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch {}
    await clearLoginSession();
    window.location.href = "/login?logout=success";
  };

  return (
    <aside
      aria-label="Navigasi utama"
      className="sidebar-glass glass-elevation liquid-glass-subtle relative flex h-full w-[68px] flex-col items-center rounded-2xl py-3"
    >
      <Link href="/dashboard" aria-label="Beranda" className="mb-1 grid size-10 place-items-center">
        <Logo className="size-7 text-primary" />
      </Link>

      <nav className="no-scrollbar flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto py-1">
        {ZONES.map((zone, zi) => {
          const groups = dashboardGroups.filter((g) => g.zone === zone);
          if (groups.length === 0) return null;
          return (
            <React.Fragment key={zone}>
              {zi > 0 && <RailDivider />}
              {groups.map((group) => (
                <RailItem
                  key={group.id}
                  group={group}
                  active={activeGroupId === group.id}
                  onSelect={onSelect}
                />
              ))}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="flex w-full flex-col items-center gap-1 pt-1">
        <RailDivider />
        <NotificationsPopover notifications={sampleNotifications} />
        {settingsRoutes.map((route) => {
          const isActive =
            pathname === route.link ||
            pathname.startsWith(route.link + "/") ||
            route.subs?.some(
              (s) =>
                pathname === s.link || pathname.startsWith(s.link + "/")
            );
          return (
            <RailLink key={route.id} route={route} active={isActive} />
          );
        })}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Sembunyikan / tampilkan panel"
              onClick={onTogglePanel}
              className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <PanelLeft className="size-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Toggle panel (⌘B)</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Akun"
              className="mt-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              <Avatar className="size-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  DA
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-52">
            <DropdownMenuLabel>Akun</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/pengaturan">
                <SettingsIcon className="size-4 text-muted-foreground" />
                Pengaturan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOutIcon className="size-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
