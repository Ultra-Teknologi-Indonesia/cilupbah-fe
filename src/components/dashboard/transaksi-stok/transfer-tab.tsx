"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PindahBinListTable } from "./pindah-bin-list-table";
import { BinTransferReceiptListTable } from "./bin-transfer-receipt-list-table";

type SubTab = "baru" | "dijalan" | "selesai";

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "baru", label: "Baru Dibuat" },
  { key: "dijalan", label: "Sedang Dijalan" },
  { key: "selesai", label: "Selesai" },
];

export function TransferTab() {
  const router = useRouter();
  const [subTab, setSubTab] = useState<SubTab>("baru");

  const handleAdd = () => {
    if (subTab === "selesai") {
      router.push("/dashboard/transaksi-stok/penerimaan-transfer");
    } else {
      router.push("/dashboard/transaksi-stok/pindah-bin");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={subTab}
          onValueChange={(v) => setSubTab(v as SubTab)}
          className="flex flex-col gap-4"
        >
          <TabsList variant="glass" className="max-w-full overflow-x-auto">
            {SUB_TABS.map(({ key, label }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-muted-foreground data-active:bg-background data-active:font-medium data-active:text-primary data-active:shadow-sm"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button size="sm" onClick={handleAdd} className="gap-1.5">
          <PlusIcon className="size-4" />
          {subTab === "selesai" ? "Penerimaan Transfer" : "Tambah Baru"}
        </Button>
      </div>

      {subTab === "baru" && <PindahBinListTable status="BARU_DIBUAT" />}
      {subTab === "dijalan" && <PindahBinListTable status="SEDANG_DIJALAN" />}
      {subTab === "selesai" && <BinTransferReceiptListTable />}
    </div>
  );
}
