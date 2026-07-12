"use client";

import { useQuery } from "@tanstack/react-query";
import { SalesReturnSettingService } from "@/services/barang-masuk/sales-return-setting.service";

const KEY = ["sales-return-setting"];

export function useSalesReturnSetting() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => SalesReturnSettingService.get(),
    staleTime: 60 * 1000,
  });
}
