"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  STAGE_CONFIG,
  type FulfillmentStage,
} from "@/types/proses-pesanan/fulfillment";

function activeStage(pathname: string): FulfillmentStage {
  for (const { key } of STAGE_CONFIG) {
    if (pathname.includes(`/proses-pesanan/${key}`)) return key;
  }
  return "picking";
}

export function StageTabs() {
  const pathname = usePathname();
  const active = activeStage(pathname);

  return (
    <Tabs value={active}>
      <TabsList variant="glass" className="max-w-full overflow-x-auto">
        {STAGE_CONFIG.map(({ key, label }) => (
          <TabsTrigger key={key} value={key} asChild>
            <Link href={`/dashboard/proses-pesanan/${key}`}>{label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
