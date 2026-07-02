"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const TABLE_PAGE_SIZES = [20, 50, 100, 200]
export const GRID_PAGE_SIZES = [24, 48, 96, 128, 196]
const DEFAULT_PAGE_SIZES = TABLE_PAGE_SIZES

interface SimplePaginationProps {
  page: number
  lastPage: number
  onPageChange: (page: number) => void
  perPage?: number
  onPerPageChange?: (size: number) => void
  pageSizeOptions?: number[]
  isFetching?: boolean
  label?: string
  total?: number
}

export function SimplePagination({
  page,
  lastPage,
  onPageChange,
  perPage,
  onPerPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  isFetching,
  label,
  total,
}: SimplePaginationProps) {
  const showSizeSelector = perPage !== undefined && onPerPageChange !== undefined

  return (
    <div className="flex flex-col-reverse items-center gap-4 border-t border-border/60 pt-3 sm:flex-row sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {total !== undefined && label ? `${total} ${label}` : " "}
      </div>

      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        {showSizeSelector && (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Baris per halaman</p>
            <Select
              value={`${perPage}`}
              onValueChange={(v) => {
                onPerPageChange!(Number(v))
                onPageChange(1)
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-[4.5rem] rounded-full border-border bg-background"
              >
                <SelectValue>{perPage}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex w-[7.5rem] items-center justify-center text-sm font-medium">
          Halaman {lastPage === 0 ? 0 : page} dari {lastPage}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={page <= 1 || isFetching}
            aria-label="Halaman pertama"
          >
            <ChevronsLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || isFetching}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(Math.min(lastPage, page + 1))}
            disabled={page >= lastPage || isFetching}
            aria-label="Halaman berikutnya"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPageChange(lastPage)}
            disabled={page >= lastPage || isFetching}
            aria-label="Halaman terakhir"
          >
            <ChevronsRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
