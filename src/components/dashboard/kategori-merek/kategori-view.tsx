"use client"

import * as React from "react"
import { DownloadIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { KategoriListTab } from "./kategori-list-tab"
import { KategoriMappingTab } from "./kategori-mapping-tab"
import { ImportSystemDialog } from "./import-system-dialog"
import { TambahKategoriDialog } from "./tambah-kategori-dialog"

export function KategoriView() {
  const [importOpen, setImportOpen] = React.useState(false)
  const [tambahOpen, setTambahOpen] = React.useState(false)

  const [search, setSearch] = React.useState("")

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => setImportOpen(true)}>
          <DownloadIcon className="size-4" />
          Import dari Sistem
        </Button>
        <Button variant="primary" size="sm" className="h-8 gap-1.5" onClick={() => setTambahOpen(true)}>
          <PlusIcon className="size-4" />
          Tambah Baru
        </Button>
      </div>

      <Tabs defaultValue="daftar">
        <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 pt-3 sm:px-5">
            <div className="overflow-x-auto">
              <TabsList variant="line">
                <TabsTrigger value="daftar">Daftar Kategori</TabsTrigger>
                <TabsTrigger value="pemetaan">Pemetaan Kategori</TabsTrigger>
              </TabsList>
            </div>

            <div className="relative w-full pb-3 sm:w-64 sm:pb-0">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori…"
                className="h-9 border-border bg-background pl-9 pr-8"
              />
              {search.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="px-4 py-5 sm:px-5">
            <TabsContent value="daftar" className="mt-0">
              <KategoriListTab search={search} />
            </TabsContent>
            <TabsContent value="pemetaan" className="mt-0">
              <KategoriMappingTab search={search} />
            </TabsContent>
          </div>
        </LiquidGlass>
      </Tabs>

      <ImportSystemDialog open={importOpen} onOpenChange={setImportOpen} />
      <TambahKategoriDialog open={tambahOpen} onOpenChange={setTambahOpen} />
    </>
  )
}
