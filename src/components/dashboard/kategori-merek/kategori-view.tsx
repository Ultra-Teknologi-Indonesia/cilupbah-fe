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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <DownloadIcon />
            Import dari Sistem
          </Button>
          <Button variant="primary" onClick={() => setTambahOpen(true)}>
            <PlusIcon />
            Tambah Baru
          </Button>
        </div>
      </div>

      <Tabs defaultValue="daftar">
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
          <TabsList variant="line" className="px-4">
            <TabsTrigger value="daftar">Daftar Kategori</TabsTrigger>
            <TabsTrigger value="pemetaan">Pemetaan Kategori</TabsTrigger>
          </TabsList>
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
