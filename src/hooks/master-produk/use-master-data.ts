"use client"

import { useQuery } from "@tanstack/react-query"

import { MasterDataService } from "@/services/master-produk/master-data.service"


const STALE = 5 * 60 * 1000


function useMasterDataQuery<T>(key: string, queryFn: () => Promise<T>) {
  return useQuery({ queryKey: ["master-produk", "lookup", key], queryFn, staleTime: STALE })
}

export const useSalesTaxes = () =>
  useMasterDataQuery("sales-taxes", MasterDataService.salesTaxes)
export const usePurchaseTaxes = () =>
  useMasterDataQuery("purchase-taxes", MasterDataService.purchaseTaxes)
export const useSalesAccounts = () =>
  useMasterDataQuery("sales-accounts", MasterDataService.salesAccounts)
export const useSalesReturnAccounts = () =>
  useMasterDataQuery("sales-return-accounts", MasterDataService.salesReturnAccounts)
export const useInventoryAccounts = () =>
  useMasterDataQuery("inventory-accounts", MasterDataService.inventoryAccounts)
export const useCogsAccounts = () =>
  useMasterDataQuery("cogs-accounts", MasterDataService.cogsAccounts)
export const useBrandOptions = () =>
  useMasterDataQuery("brands", MasterDataService.brands)
export const useShopOptions = () =>
  useMasterDataQuery("shops", MasterDataService.shops)
export const useCategoryTree = () =>
  useMasterDataQuery("categories", MasterDataService.categoryTree)


export const useCategoryFormAttributes = (categoryId?: string | number | null) =>
  useQuery({
    queryKey: ["master-produk", "category-attributes", categoryId],
    queryFn: () => MasterDataService.categoryFormAttributes(categoryId!),
    enabled: categoryId != null && categoryId !== "",
    staleTime: STALE,
    retry: false,
  })
