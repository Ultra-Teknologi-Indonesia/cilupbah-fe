"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BookOpenIcon, HelpCircleIcon, CodeIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaqTab } from "@/components/bantuan/faq/faq-tab";
import { ManualTab } from "@/components/bantuan/manual/manual-tab";
import { ApiDocsTab } from "@/components/bantuan/api-docs/api-docs-tab";

const TAB_KEYS = ["faq", "panduan", "api"] as const;
type TabKey = (typeof TAB_KEYS)[number];

function isTab(v: string | null): v is TabKey {
  return v !== null && (TAB_KEYS as readonly string[]).includes(v);
}

export function BantuanTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const initial = params.get("tab");
  const [tab, setTab] = React.useState<TabKey>(isTab(initial) ? initial : "faq");

  const changeTab = (value: string) => {
    if (!isTab(value)) return;
    setTab(value);
    const next = new URLSearchParams(Array.from(params.entries()));
    next.set("tab", value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={tab} onValueChange={changeTab} className="w-full">
      <TabsList variant="glass">
        <TabsTrigger value="faq" className="gap-1.5">
          <HelpCircleIcon className="size-4" />
          FAQ
        </TabsTrigger>
        <TabsTrigger value="panduan" className="gap-1.5">
          <BookOpenIcon className="size-4" />
          Panduan
        </TabsTrigger>
        <TabsTrigger value="api" className="gap-1.5">
          <CodeIcon className="size-4" />
          Dokumentasi API
        </TabsTrigger>
      </TabsList>

      <TabsContent value="faq" className="mt-6">
        <FaqTab />
      </TabsContent>
      <TabsContent value="panduan" className="mt-6">
        <ManualTab />
      </TabsContent>
      <TabsContent value="api" className="mt-6">
        <ApiDocsTab />
      </TabsContent>
    </Tabs>
  );
}
