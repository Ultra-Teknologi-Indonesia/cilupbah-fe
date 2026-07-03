const fs = require('fs');
let file = 'src/components/dashboard/shared/pill-tabs.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('@/components/ui/tabs')) {
    c = c.replace(/import \{ Skeleton \} from "@\/components\/ui\/skeleton";/, 'import { Skeleton } from "@/components/ui/skeleton";\nimport { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";');
}

c = c.replace(/export function PillTab([\s\S]*?)<\/button>\n  \);\n}/, `export function PillTab<T extends string>({
  item,
  active,
  variant = "solid",
  onSelect,
}: {
  item: PillTabItem<T>;
  active: boolean;
  variant?: "solid" | "soft";
  onSelect: (key: T) => void;
}) {
  const Icon = item.icon;
  return (
    <TabsTrigger
      value={item.key}
      className={cn(
        "inline-flex h-auto items-center gap-1.5 rounded-full font-medium transition-colors after:hidden!",
        variant === "solid" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
        active
          ? variant === "solid"
            ? "bg-foreground! text-background! shadow-sm!"
            : "bg-foreground/10! text-foreground!"
          : variant === "solid"
            ? "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {item.label}
      {item.countLoading ? (
        <Skeleton className="h-4 w-6 rounded-full" />
      ) : item.count != null ? (
        <span
          className={cn(
            "rounded-full px-1.5 text-xs tabular-nums",
            active && variant === "solid"
              ? "bg-background/20 text-background"
              : "bg-background text-muted-foreground",
          )}
        >
          {item.count}
        </span>
      ) : null}
    </TabsTrigger>
  );
}`);

c = c.replace(/export function PillTabs([\s\S]*?)<\/div>\n  \);\n}/, `export function PillTabs<T extends string>({
  items,
  active,
  onSelect,
  variant = "solid",
  className,
}: {
  items: PillTabItem<T>[];
  active: T | null;
  onSelect: (key: T) => void;
  variant?: "solid" | "soft";
  className?: string;
}) {
  return (
    <Tabs value={active || ""} onValueChange={(val) => onSelect(val as T)}>
      <TabsList className={cn("h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0", className)}>
        {items.map((item) => (
          <PillTab
            key={item.key}
            item={item}
            active={active === item.key}
            variant={variant}
            onSelect={onSelect}
          />
        ))}
      </TabsList>
    </Tabs>
  );
}`);

fs.writeFileSync(file, c);
console.log("Refactored PillTabs");
