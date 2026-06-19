"use client"

import * as React from "react"
import { DownloadIcon, PlusIcon, SearchIcon } from "lucide-react"

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

  const [draftSearch, setDraftSearch] = React.useState("")
  const [search, setSearch] = React.useState("")

  const apply = () => setSearch(draftSearch.trim())
  const reset = () => {
    setDraftSearch("")
    setSearch("")
  }

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
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Panel filter */}
          <aside className="lg:w-64 lg:shrink-0">
            <LiquidGlass radius={20} intensity="subtle" className="bg-white/40 p-4 dark:bg-white/[0.06]">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium">Filter</span>
                {draftSearch && (
                  <button type="button" onClick={reset} className="text-sm font-medium text-destructive hover:underline">
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={draftSearch}
                    onChange={(e) => setDraftSearch(e.target.value)}
                    placeholder="Cari kategori"
                    className="h-9 rounded-lg border-border bg-background pl-9"
                  />
                </div>
                <Button variant="primary" className="w-full" onClick={apply}>
                  Terapkan
                </Button>
              </div>
            </LiquidGlass>
          </aside>

          {/* Konten */}
          <div className="min-w-0 flex-1">
            <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 pt-3 sm:px-5">
                <div className="overflow-x-auto">
                  <TabsList variant="line">
                    <TabsTrigger value="daftar">Daftar Kategori</TabsTrigger>
                    <TabsTrigger value="pemetaan">Pemetaan Kategori</TabsTrigger>
                  </TabsList>
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
          </div>
        </div>
      </Tabs>

      <ImportSystemDialog open={importOpen} onOpenChange={setImportOpen} />
      <TambahKategoriDialog open={tambahOpen} onOpenChange={setTambahOpen} />
    </>
  )
}
