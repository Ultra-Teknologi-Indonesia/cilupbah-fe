import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { InventoryStockService } from "@/services/persediaan/inventory.service";

interface UseStockedItemsParams {
  locationId: string;
  search?: string;
  page?: number;
  perPage?: number;
  enabled?: boolean;
  includeZero?: boolean;
}

export function useStockedItems({
  locationId,
  search,
  page,
  perPage = 20,
  enabled = true,
  includeZero = false,
}: UseStockedItemsParams) {
  return useQuery({
    queryKey: ["stocked-items", locationId, search, page, perPage, includeZero],
    enabled: enabled && !!locationId,
    placeholderData: keepPreviousData,
    queryFn: () =>
      InventoryStockService.stockedItems({
        locationId,
        search: search || undefined,
        page,
        perPage,
        includeZero,
      }),
    staleTime: 30 * 1000,
  });
}
