"use client"

import * as React from "react"
import {
  InfoIcon,
  Loader2Icon,
  MoreHorizontalIcon,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { SimplePagination, TABLE_PAGE_SIZES } from "@/components/ui/simple-pagination"
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
          <Table className="table-fixed w-full" containerClassName="overflow-x-hidden">
            <colgroup>
              <col className="w-[34%]" />
              {channels.map((ch) => (
                <col key={ch.code} />
              ))}
              <col className="w-11" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-normal">Cilupbah</TableHead>
                {channels.map((ch) => (
                  <TableHead key={ch.code} className="whitespace-normal">
                    {ch.name}
                  </TableHead>
                ))}
                <TableHead className="px-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.category_id}>
                  <TableCell className="whitespace-normal align-top font-medium text-sm">
                    <span className="line-clamp-2 break-words" title={item.full_category_name}>
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
                      <TableCell key={ch.code} className="whitespace-normal align-top text-sm">
                        {name ? (
                          <button
                            type="button"
                            onClick={openPicker}
                            title={name}
                            className="text-left text-primary hover:underline cursor-pointer line-clamp-2 break-words"
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
                  <TableCell className="px-1 align-top">
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
        <SimplePagination
          page={currentPage}
          lastPage={lastPage}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={setPerPage}
          total={total}
          pageSizeOptions={TABLE_PAGE_SIZES}
          label="pemetaan"
          isFetching={isFetching}
        />
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
