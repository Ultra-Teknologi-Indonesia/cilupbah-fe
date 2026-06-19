"use client"

import * as React from "react"
import { DownloadIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { KategoriListTab } from "./kategori-list-tab"
import { KategoriMappingTab } from "./kategori-mapping-tab"
import { ImportSystemDialog } from "./import-system-dialog"
import { TambahKategoriDialog } from "./tambah-kategori-dialog"

export function KategoriView() {
  const [importOpen, setImportOpen] = React.useState(false)
  const [tambahOpen, setTambahOpen] = React.useState(false)

  return (
    <>
      <Tabs defaultValue="daftar">
        <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 sm:px-5">
            <div className="overflow-x-auto">
              <TabsList variant="line">
                <TabsTrigger value="daftar">Daftar Kategori</TabsTrigger>
                <TabsTrigger value="pemetaan">Pemetaan Kategori</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => setImportOpen(true)}>
                <DownloadIcon className="size-4" />
                Import dari Sistem
              </Button>
              <Button variant="primary" size="sm" className="h-8 gap-1.5" onClick={() => setTambahOpen(true)}>
                <PlusIcon className="size-4" />
                Tambah Baru
              </Button>
            </div>
          </div>
        </LiquidGlass>

        <TabsContent value="daftar">
          <KategoriListTab />
        </TabsContent>
        <TabsContent value="pemetaan">
          <KategoriMappingTab />
        </TabsContent>
      </Tabs>

      <ImportSystemDialog open={importOpen} onOpenChange={setImportOpen} />
      <TambahKategoriDialog open={tambahOpen} onOpenChange={setTambahOpen} />
    </>
  )
}
