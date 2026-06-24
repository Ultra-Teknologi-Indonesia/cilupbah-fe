"use client"

import { Suspense } from "react"
import { Construction } from "lucide-react"

import { PageTitle } from "@/components/dashboard/page-title"
import { TableSkeleton } from "@/components/ui/page-skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PesananListView } from "@/components/dashboard/transaksi-pembelian/pesanan-list-view"
import { TagihanListView } from "@/components/dashboard/transaksi-pembelian/tagihan-list-view"

export default function TransaksiPembelianPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Transaksi Pembelian"
        description="Kelola pesanan pembelian, tagihan, dan retur dari pemasok."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pembelian" },
          { label: "Transaksi Pembelian" },
        ]}
      />

      <Tabs defaultValue="pesanan">
        <TabsList variant="line">
          <TabsTrigger value="pesanan">Pesanan</TabsTrigger>
          <TabsTrigger value="tagihan">Tagihan</TabsTrigger>
          <TabsTrigger value="retur">Retur</TabsTrigger>
        </TabsList>

        <TabsContent value="pesanan">
          <Suspense fallback={<TableSkeleton rows={6} cols={7} />}>
            <PesananListView />
          </Suspense>
        </TabsContent>

        <TabsContent value="tagihan">
          <Suspense fallback={<TableSkeleton rows={6} cols={8} />}>
            <TagihanListView />
          </Suspense>
        </TabsContent>

        <TabsContent value="retur">
          <div className="flex flex-col items-center justify-center gap-4 py-32 text-muted-foreground">
            <Construction className="h-12 w-12" />
            <div className="text-center">
              <p className="text-lg font-medium">Retur Pembelian</p>
              <p className="mt-1 text-sm">Fitur ini sedang dalam pengembangan.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
