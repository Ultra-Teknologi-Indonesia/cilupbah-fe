"use client";

import * as React from "react";
import Link from "next/link";
import { PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
          ? "bg-brand/10 text-brand"
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

function RailLink({ route }: { route: Route }) {
  const Icon = route.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={route.link}
          aria-label={route.title}
          className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
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
        {settingsRoutes.map((route) => (
          <RailLink key={route.id} route={route} />
        ))}
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
        <Avatar className="mt-1 size-9">
          <AvatarImage src="" />
          <AvatarFallback className="bg-brand/10 text-brand font-medium">DA</AvatarFallback>
        </Avatar>
      </div>
    </aside>
  );
}
