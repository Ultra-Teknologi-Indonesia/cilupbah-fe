# Graph Report - cilupbah-fe  (2026-06-14)

## Corpus Check
- 60 files · ~13,986 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 321 nodes · 610 edges · 27 communities (16 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 83 edges
2. `compilerOptions` - 16 edges
3. `useSidebar()` - 14 edges
4. `Button()` - 8 edges
5. `SidebarMenuButton()` - 8 edges
6. `DashboardSidebar()` - 7 edges
7. `tailwind` - 6 edges
8. `aliases` - 6 edges
9. `Avatar()` - 6 edges
10. `AvatarImage()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts
- `DropdownMenuRadioItem()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuSubTrigger()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuSubContent()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (27 total, 11 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (27): setLoginSession(), LoginForm(), loginSchema, LoginValues, LoginScreen(), metadata, Button(), buttonVariants (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (24): dependencies, axios, class-variance-authority, clsx, framer-motion, @hookform/resolvers, lucide-react, next (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (27): TeamSwitcher(), DashboardNavigation(), SUB_MENU_TRANSITION, SubRoute, Notification, Team, TeamSwitcher(), DropdownMenu() (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (11): AuthService, AuthData, LoginRequest, LoginResponse, User, apiClient, fetchClient(), AuthState (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (21): useGlassSpecular(), DashboardSidebar(), Logo(), dashboardGroups, findGroupIdForPath(), isLeafGroup(), linkMatchLen(), NavGroup (+13 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (43): useIsMobile(), cn(), data, SidebarItem, sidebarItems, Avatar(), AvatarBadge(), AvatarFallback() (+35 more)

### Community 14 - "Community 14"
Cohesion: 0.21
Nodes (8): geistMono, geistSans, inter, metadata, RootLayout(), QueryProvider(), LiquidGlassFilter(), Toaster()

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (3): config, guestRoutes, protectedRoutes

### Community 16 - "Community 16"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **120 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 10` to `Community 0`, `Community 3`, `Community 4`, `Community 8`, `Community 14`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 6`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `ApiResponse` connect `Community 7` to `Community 0`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _120 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08826945412311266 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._