"use client";

import * as React from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProdukSettingsTable } from "./produk-settings-table";
import { SyncStokHargaView } from "./sync-stok-harga-view";

type Tab = "produk" | "sync";

export function InventorySettingsView() {
  const [tab, setTab] = React.useState<Tab>("produk");

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList variant="line" className="h-auto">
          <TabsTrigger value="produk">Produk</TabsTrigger>
          <TabsTrigger value="sync">Sync Stok dan Harga</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "produk" ? (
        <ProdukSettingsTable />
      ) : (
        <SyncStokHargaView embedded />
      )}
    </div>
  );
}
