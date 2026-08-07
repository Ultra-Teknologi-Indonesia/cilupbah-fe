"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PaginationState, SortingState } from "@tanstack/react-table";

type FilterPrimitive = string | number | boolean | null | undefined;

export function useListState<F extends object>(
  emptyFilters: F,
  opts?: {
    perPage?: number;
    debounceMs?: number;
    urlSync?: boolean;
    namespace?: string;
    filterUrlSync?: boolean;
  },
) {
  const urlSync = opts?.urlSync ?? true;
  const filterUrlSync = opts?.filterUrlSync ?? urlSync;
  const ns = opts?.namespace ? `${opts.namespace}_` : "";
  const defaultPerPage = opts?.perPage ?? 20;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const lastPushedSearchRef = useRef<string>(
    urlSync ? (searchParams.get(`${ns}search`) ?? "").trim() : "",
  );

  const pageKey = `${ns}page`;
  const perPageKey = `${ns}per_page`;
  const searchKey = `${ns}search`;
  const filterKeyFor = useCallback(
    (k: string) => `${ns}filter_${k}`,
    [ns],
  );

  const readNumber = useCallback(
    (key: string, fallback: number) => {
      if (!urlSync) return fallback;
      const raw = searchParams.get(key);
      const n = raw ? Number.parseInt(raw, 10) : NaN;
      return Number.isFinite(n) && n > 0 ? n : fallback;
    },
    [urlSync, searchParams],
  );
  const readSearch = useCallback(
    () => (urlSync ? (searchParams.get(searchKey) ?? "") : ""),
    [urlSync, searchParams, searchKey],
  );
  const readFilters = useCallback((): F => {
    if (!filterUrlSync) return emptyFilters;
    const src = emptyFilters as Record<string, FilterPrimitive>;
    const next = { ...src };
    for (const k of Object.keys(src)) {
      const raw = searchParams.get(filterKeyFor(k));
      if (raw === null) continue;
      const defaultVal = src[k];
      let parsed: FilterPrimitive = raw;
      if (typeof defaultVal === "number") parsed = Number(raw);
      else if (typeof defaultVal === "boolean") parsed = raw === "true";
      next[k] = parsed;
    }
    return next as F;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUrlSync, searchParams, filterKeyFor]);

  const [search, setSearchRaw] = useState<string>(() => readSearch());
  const [debouncedSearch, setDebouncedSearch] = useState<string>(() =>
    readSearch().trim(),
  );
  const [page, setPageRaw] = useState<number>(() => readNumber(pageKey, 1));
  const [perPage, setPerPageRaw] = useState<number>(() =>
    readNumber(perPageKey, defaultPerPage),
  );
  const [filters, setFiltersRaw] = useState<F>(() => readFilters());

  const sortByRawKey = `${ns}sort_by`;
  const sortDirRawKey = `${ns}sort_dir`;
  const [sorting, setSortingRaw] = useState<SortingState>(() => {
    if (!urlSync) return [];
    const id = searchParams.get(sortByRawKey);
    const dir = searchParams.get(sortDirRawKey);
    if (id) {
      return [{ id, desc: dir === "desc" }];
    }
    return [];
  });

  useEffect(() => {
    if (!urlSync) return;
    const nextPage = readNumber(pageKey, 1);
    const nextPerPage = readNumber(perPageKey, defaultPerPage);
    const nextSearch = readSearch();
    const nextFilters = readFilters();
    const nextSortBy = searchParams.get(sortByRawKey);
    const nextSortDir = searchParams.get(sortDirRawKey);

    /* eslint-disable react-hooks/set-state-in-effect */
    setPageRaw((prev) => (prev === nextPage ? prev : nextPage));
    setPerPageRaw((prev) => (prev === nextPerPage ? prev : nextPerPage));

    const nextTrimmed = nextSearch.trim();
    if (nextTrimmed !== lastPushedSearchRef.current) {
      lastPushedSearchRef.current = nextTrimmed;
      setSearchRaw((prev) => (prev === nextSearch ? prev : nextSearch));
      setDebouncedSearch((prev) => (prev === nextTrimmed ? prev : nextTrimmed));
    }
    setFiltersRaw((prev) => {
      const prevR = prev as Record<string, FilterPrimitive>;
      const nextR = nextFilters as Record<string, FilterPrimitive>;
      for (const k of Object.keys(nextR)) {
        if (prevR[k] !== nextR[k]) return nextFilters;
      }
      return prev;
    });
    setSortingRaw((prev) => {
      if (!nextSortBy) return prev.length === 0 ? prev : [];
      if (prev.length === 1 && prev[0].id === nextSortBy && prev[0].desc === (nextSortDir === "desc")) {
        return prev;
      }
      return [{ id: nextSortBy, desc: nextSortDir === "desc" }];
    });
    /* eslint-enable react-hooks/set-state-in-effect */

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSync, searchParams]);

  const writeUrl = useCallback(
    (updates: Record<string, string | number | boolean | null | undefined>) => {
      if (!urlSync) return;
      const params = new URLSearchParams(searchParamsRef.current.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          (key === pageKey && value === 1) ||
          (key === perPageKey && value === defaultPerPage)
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const qs = params.toString();
      searchParamsRef.current =
        new URLSearchParams(qs) as unknown as typeof searchParamsRef.current;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [urlSync, router, pathname, pageKey, perPageKey, defaultPerPage],
  );

  const setPage = useCallback(
    (p: number) => {
      setPageRaw(p);
      writeUrl({ [pageKey]: p });
    },
    [writeUrl, pageKey],
  );

  const setPerPage = useCallback(
    (pp: number) => {
      setPerPageRaw(pp);
      writeUrl({ [perPageKey]: pp });
    },
    [writeUrl, perPageKey],
  );

  const setSearch = useCallback((s: string) => {
    setSearchRaw(s);
  }, []);

  const resetPage = useCallback(() => {
    setPageRaw(1);
    writeUrl({ [pageKey]: 1 });
  }, [writeUrl, pageKey]);

  const debounceMs = opts?.debounceMs ?? 300;
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = search.trim();
      if (trimmed === debouncedSearch) return;
      lastPushedSearchRef.current = trimmed;
      setDebouncedSearch(trimmed);
      setPageRaw(1);
      if (urlSync) {
        writeUrl({ [searchKey]: trimmed || null, [pageKey]: 1 });
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch, debounceMs, urlSync, writeUrl, searchKey, pageKey]);

  const setFilters = useCallback(
    (f: F) => {
      setFiltersRaw(f);
      setPageRaw(1);
      if (!urlSync) return;
      const updates: Record<string, FilterPrimitive> = { [pageKey]: 1 };
      if (filterUrlSync) {
        const fR = f as Record<string, FilterPrimitive>;
        const defR = emptyFilters as Record<string, FilterPrimitive>;
        for (const k of Object.keys(fR)) {
          const val = fR[k];
          const def = defR[k];
          updates[filterKeyFor(k)] =
            val === def || val === "" || val === null || val === undefined
              ? null
              : val;
        }
      }
      writeUrl(updates);
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [urlSync, filterUrlSync, writeUrl, pageKey, filterKeyFor],
  );

  const resetFilters = useCallback(
    () => {
      setFiltersRaw(emptyFilters);
      setPageRaw(1);
      if (!urlSync) return;
      const updates: Record<string, FilterPrimitive> = { [pageKey]: 1 };
      if (filterUrlSync) {
        for (const k of Object.keys(
          emptyFilters as Record<string, FilterPrimitive>,
        )) {
          updates[filterKeyFor(k)] = null;
        }
      }
      writeUrl(updates);
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [urlSync, filterUrlSync, writeUrl, pageKey, filterKeyFor],
  );

  const setSorting = useCallback(
    (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      setSortingRaw((old) => {
        const next =
          typeof updaterOrValue === "function"
            ? updaterOrValue(old)
            : updaterOrValue;
        if (urlSync) {
          if (next.length > 0) {
            writeUrl({
              [sortByRawKey]: next[0].id,
              [sortDirRawKey]: next[0].desc ? "desc" : "asc",
            });
          } else {
            writeUrl({
              [sortByRawKey]: null,
              [sortDirRawKey]: null,
            });
          }
        }
        return next;
      });
    },
    [writeUrl, urlSync, sortByRawKey, sortDirRawKey],
  );

  const hasActiveFilter = Object.values(filters).some(Boolean);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: page - 1, pageSize: perPage }),
    [page, perPage],
  );

  const onPaginationChange = useCallback(
    (p: PaginationState) => {
      const nextPage = p.pageIndex + 1;
      const nextPerPage = p.pageSize;
      setPageRaw(nextPage);
      setPerPageRaw(nextPerPage);
      writeUrl({ [pageKey]: nextPage, [perPageKey]: nextPerPage });
    },
    [writeUrl, pageKey, perPageKey],
  );

  return {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    perPage,
    setPerPage,
    resetPage,
    filters,
    setFilters,
    resetFilters,
    sorting,
    setSorting,
    hasActiveFilter,
    activeFilterCount,
    pagination,
    onPaginationChange,
  };
}
