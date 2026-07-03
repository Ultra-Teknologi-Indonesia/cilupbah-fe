"use client";
import { EmptyState } from "@/components/ui/empty-state";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import {  DownloadIcon, Loader2Icon , SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { DataTable } from "@/components/ui/data-table/data-table";
import { FilterToolbar } from "@/components/dashboard/shared/filter-toolbar";
import type { useListState } from "@/hooks/use-list-state";

type ListState = ReturnType<typeof useListState<never>>;

interface ResourceListViewProps<T> {
  list: Pick<
    ListState,
    | "search"
    | "setSearch"
    | "hasActiveFilter"
    | "activeFilterCount"
    | "pagination"
    | "onPaginationChange"
    | "resetFilters"
  >;
  columns: ColumnDef<T>[];
  rows: T[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  searchPlaceholder: string;

  filterControls?: React.ReactNode;
  filterGridCols?: 1 | 2 | 3 | 4;

  onExport?: () => void;

  toolbarLeading?: React.ReactNode;

  toolbarTrailing?: React.ReactNode;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}

export function ResourceListView<T>({
  list,
  columns,
  rows,
  total,
  isLoading,
  isFetching,
  searchPlaceholder,
  filterControls,
  filterGridCols = 2,
  onExport,
  toolbarLeading,
  toolbarTrailing,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
}: ResourceListViewProps<T>) {
  return (
    <LiquidGlass
      radius={20}
      intensity="subtle"
      className="bg-white/30 dark:bg-white/[0.04]"
    >
      <FilterToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder={searchPlaceholder}
        align="end"
        onReset={list.hasActiveFilter ? list.resetFilters : undefined}
        hasFilter={list.hasActiveFilter}
        activeCount={list.activeFilterCount}
        gridCols={filterGridCols}
        leading={
          <>
            {toolbarLeading}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={rows.length === 0}
              >
                <DownloadIcon className="mr-1.5 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </>
        }
        trailing={toolbarTrailing}
      >
        {filterControls}
      </FilterToolbar>

      {isFetching && !isLoading && (
        <div className="flex justify-center py-1">
          <Loader2Icon className="size-4 animate-spin text-primary" />
        </div>
      )}

      <div className="px-5 py-5 sm:px-6">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          hideToolbar
          manualPagination
          pagination={list.pagination}
          rowCount={total}
          onPaginationChange={list.onPaginationChange}
          tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
          emptyState={
            list.search ? <EmptyState icon={SearchXIcon} title="Tidak ditemukan" description={`Tidak ada hasil untuk "${list.search}"`} /> : <EmptyState icon={EmptyIcon} title={emptyTitle} description={emptyDescription} />
          }
        />
      </div>
    </LiquidGlass>
  );
}
