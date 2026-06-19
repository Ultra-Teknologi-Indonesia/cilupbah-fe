"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  InfoIcon,
  Loader2Icon,
  MoreHorizontalIcon,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useKategoriMapping } from "@/hooks/kategori-merek/use-kategori"
import type { ChannelInfo } from "@/types/kategori-merek/kategori"
import { PetakanKategoriDialog } from "./petakan-kategori-dialog"

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50]

export function KategoriMappingTab({ search }: { search: string }) {
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(20)

  const prevSearch = React.useRef(search)
  if (prevSearch.current !== search) {
    prevSearch.current = search
    if (page !== 1) setPage(1)
  }

  const { data, isLoading, isError, isFetching } = useKategoriMapping({
    search: search || undefined,
    page,
    perPage,
  })

  const items = data?.items ?? []
  const total = data?.meta?.total ?? 0
  const currentPage = data?.meta?.current_page ?? page
  const lastPage = data?.meta?.last_page ?? 1

  const channels: ChannelInfo[] = items[0]?.channels ?? []

  const [pickerState, setPickerState] = React.useState<{
    categoryId: number
    categoryName: string
    channelId: string
    channelCode: string
    channelName: string
    mappedExternalId?: string
  } | null>(null)

  return (
    <>
      <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm text-primary mb-4">
        <InfoIcon className="mt-0.5 size-4 shrink-0" />
        <p>Cek atribut dan petakan nilai atribut sesuai keinginan.</p>
      </div>

      <div className="flex items-center justify-end pb-3 text-sm text-muted-foreground">
        Total <span className="ml-2 font-medium text-foreground tabular-nums">{total}</span>
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
        <div className="overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%] bg-background/80 backdrop-blur-sm">
                  Cilupbah
                </TableHead>
                {channels.map((ch) => (
                  <TableHead key={ch.code}>
                    {ch.name}
                  </TableHead>
                ))}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.category_id}>
                  <TableCell className="bg-background/80 backdrop-blur-sm font-medium text-sm">
                    <span className="line-clamp-2" title={item.full_category_name}>
                      {item.full_category_name}
                    </span>
                  </TableCell>
                  {channels.map((ch) => {
                    const name = item[`${ch.code}_category_name`] as string | null
                    const extId = item[`${ch.code}_category_id`] as string | null
                    const openPicker = () =>
                      setPickerState({
                        categoryId: item.category_id,
                        categoryName: item.full_category_name,
                        channelId: ch.id,
                        channelCode: ch.code,
                        channelName: ch.name,
                        mappedExternalId: extId ?? undefined,
                      })
                    return (
                      <TableCell key={ch.code} className="text-sm">
                        {name ? (
                          <button
                            type="button"
                            onClick={openPicker}
                            title={name}
                            className="text-left text-primary hover:underline cursor-pointer line-clamp-2"
                          >
                            {name.split(" > ").pop()}
                          </button>
                        ) : (
                          <Button variant="primary" size="sm" onClick={openPicker}>
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

      {!isLoading && !isError && (
        <div className="flex flex-col-reverse items-center gap-4 border-t border-border/60 pt-3 sm:flex-row sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {total} pemetaan
          </div>

          <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Baris per halaman</p>
              <Select
                value={`${perPage}`}
                onValueChange={(v) => {
                  setPerPage(Number(v))
                  setPage(1)
                }}
              >
                <SelectTrigger size="sm" className="w-[4.5rem] rounded-full border-border bg-background">
                  <SelectValue>{perPage}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-[7.5rem] items-center justify-center text-sm font-medium">
              Halaman {lastPage === 0 ? 0 : currentPage} dari {lastPage}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="hidden size-8 lg:flex"
                onClick={() => setPage(1)}
                disabled={currentPage <= 1 || isFetching}
                aria-label="Halaman pertama"
              >
                <ChevronsLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isFetching}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPage((p) => p + 1)}
                disabled={currentPage >= lastPage || isFetching}
                aria-label="Halaman berikutnya"
              >
                <ChevronRightIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hidden size-8 lg:flex"
                onClick={() => setPage(lastPage)}
                disabled={currentPage >= lastPage || isFetching}
                aria-label="Halaman terakhir"
              >
                <ChevronsRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <PetakanKategoriDialog
        open={!!pickerState}
        onOpenChange={(open) => !open && setPickerState(null)}
        channelId={pickerState?.channelId ?? ""}
        channelCode={pickerState?.channelCode ?? ""}
        channelName={pickerState?.channelName ?? ""}
        categoryId={pickerState?.categoryId ?? 0}
        categoryName={pickerState?.categoryName ?? ""}
        mappedExternalId={pickerState?.mappedExternalId}
        onSuccess={() => setPickerState(null)}
      />
    </>
  )
}
