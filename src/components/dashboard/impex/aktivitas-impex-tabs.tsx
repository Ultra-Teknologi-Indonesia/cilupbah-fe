"use client";

import { FileDownIcon, FileUpIcon } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlTab } from "@/hooks/use-url-tab";
import { ImportTab } from "@/components/dashboard/impex/import-tab";
import { ExportTab } from "@/components/dashboard/impex/export-tab";

type Tab = "import" | "export";

const TABS: { key: Tab; label: string }[] = [
  { key: "import", label: "Import" },
  { key: "export", label: "Ekspor" },
];

const TAB_KEYS = TABS.map((t) => t.key);

export function AktivitasImpexTabs() {
  const [activeTab, setActiveTab] = useUrlTab<Tab>("tab", "import", {
    validValues: TAB_KEYS,
  });

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
        <TabsList variant="glass" className="max-w-full overflow-x-auto">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
            >
              {tab.key === "import" ? <FileDownIcon /> : <FileUpIcon />}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {activeTab === "import" && <ImportTab />}
      {activeTab === "export" && <ExportTab />}
    </>
  );
}
