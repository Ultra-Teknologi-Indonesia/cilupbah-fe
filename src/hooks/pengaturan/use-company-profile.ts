"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CompanyProfileService } from "@/services/pengaturan/company-profile.service";
import { apiError } from "@/lib/toast";
import type { SaveCompanyProfileInput } from "@/types/pengaturan/company-profile";

const companyProfileKey = ["pengaturan", "company-profile"] as const;

export function useCompanyProfile() {
  return useQuery({
    queryKey: companyProfileKey,
    queryFn: () => CompanyProfileService.get(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveCompanyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveCompanyProfileInput) =>
      CompanyProfileService.save(input),
    onSuccess: (data) => {
      queryClient.setQueryData(companyProfileKey, data);
      toast.success("Berhasil menyimpan identitas perusahaan");
    },
    onError: (err) => apiError(err, "Gagal menyimpan identitas perusahaan"),
  });
}
