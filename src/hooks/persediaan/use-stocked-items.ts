import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { InventoryStockService } from "@/services/persediaan/inventory.service";

interface UseStockedItemsParams {
  locationId: string;
  search?: string;
  page?: number;
  perPage?: number;
  enabled?: boolean;
}

export function useStockedItems({
  locationId,
  search,
  page,
  perPage = 20,
  enabled = true,
}: UseStockedItemsParams) {
  return useQuery({
    queryKey: ["stocked-items", locationId, search, page, perPage],
    enabled: enabled && !!locationId,
    placeholderData: keepPreviousData,
    queryFn: () =>
      InventoryStockService.stockedItems({
        locationId,
        search: search || undefined,
        page,
        perPage,
      }),
    staleTime: 30 * 1000,
  });
}
