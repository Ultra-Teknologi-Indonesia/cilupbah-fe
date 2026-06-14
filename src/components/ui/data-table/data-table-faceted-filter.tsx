"use client"

import type { Column } from "@tanstack/react-table"
import { CheckIcon, PlusCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FacetedFilterOption } from "./types"

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title: string
  options: FacetedFilterOption[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selected = new Set(column?.getFilterValue() as string[])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full">
          <PlusCircleIcon className="size-4" />
          {title}
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {selected.size}
              </Badge>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const isSelected = selected.has(option.value)
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={(e) => {
                e.preventDefault()
                if (isSelected) selected.delete(option.value)
                else selected.add(option.value)
                const values = Array.from(selected)
                column?.setFilterValue(values.length ? values : undefined)
              }}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-[4px] border",
                  isSelected
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-input [&_svg]:invisible"
                )}
              >
                <CheckIcon className="size-3" />
              </span>
              {option.icon && (
                <option.icon className="size-4 text-muted-foreground" />
              )}
              <span className="flex-1">{option.label}</span>
              {facets?.get(option.value) !== undefined && (
                <span className="font-mono text-xs text-muted-foreground">
                  {facets.get(option.value)}
                </span>
              )}
            </DropdownMenuItem>
          )
        })}
        {selected.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => column?.setFilterValue(undefined)}
              className="justify-center text-muted-foreground"
            >
              Hapus filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
