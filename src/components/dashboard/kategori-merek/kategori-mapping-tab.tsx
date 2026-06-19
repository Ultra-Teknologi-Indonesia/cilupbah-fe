"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  SearchIcon,
} from "lucide-react"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FilterShell } from "@/components/dashboard/master-produk/filter-shell"
import { useKategoriMapping } from "@/hooks/kategori-merek/use-kategori"
import type { ChannelInfo } from "@/types/kategori-merek/kategori"

export function KategoriMappingTab() {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, isError, isFetching } = useKategoriMapping({
    search: search || undefined,
    page,
    perPage: 15,
  })

  const items = data?.items ?? []
  const total = data?.meta?.total ?? 0
  const currentPage = data?.meta?.current_page ?? page
  const lastPage = data?.meta?.last_page ?? 1

  const channels: ChannelInfo[] = items[0]?.channels ?? []

  const resetFilter = () => {
    setSearchInput("")
    setSearch("")
    setPage(1)
  }

  return (
    <FilterShell
      filters={
        <>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari kategori"
              className="pl-9"
            />
          </div>
          <Button variant="primary" size="sm" className="w-full" onClick={() => setSearch(searchInput.trim())}>
            Terapkan
          </Button>
        </>
      }
      onReset={searchInput ? resetFilter : undefined}
    >
      <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm text-primary mb-4">
        <InfoIcon className="mt-0.5 size-4 shrink-0" />
        <p>Cek atribut dan petakan nilai atribut sesuai keinginan.</p>
      </div>

      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex items-center justify-end px-5 py-3 text-sm text-muted-foreground">
          Total <Badge className="ml-2">{total}</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" /> Memuat pemetaan…
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-destructive">
            Gagal memuat data pemetaan kategori.
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Belum ada kategori yang diaktifkan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 bg-muted/50 min-w-[250px]">
                    Cilupbah
                  </TableHead>
                  {channels.map((ch) => (
                    <TableHead key={ch.code} className="min-w-[180px]">
                      {ch.name}
                    </TableHead>
                  ))}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.category_id}>
                    <TableCell className="sticky left-0 z-10 bg-background font-medium whitespace-nowrap">
                      {item.full_category_name}
                    </TableCell>
                    {channels.map((ch) => {
                      const name = item[`${ch.code}_category_name`] as string | null
                      return (
                        <TableCell key={ch.code} className="text-sm">
                          {name ? (
                            <span className="text-primary">{name}</span>
                          ) : (
                            <Button variant="primary" size="sm">
                              Petakan
                            </Button>
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/kategori-merek/kategori/${item.category_id}/atribut`}>
                              Lihat Atribut
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/kategori-merek/kategori/${item.category_id}/variasi`}>
                              Lihat Variasi
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && lastPage > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3">
            <span className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {lastPage}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeftIcon /> Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= lastPage || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya <ChevronRightIcon />
              </Button>
            </div>
          </div>
        )}
      </LiquidGlass>
    </FilterShell>
  )
}
