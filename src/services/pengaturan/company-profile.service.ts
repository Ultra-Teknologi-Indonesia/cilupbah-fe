import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  CompanyProfile,
  SaveCompanyProfileInput,
} from "@/types/pengaturan/company-profile";

const BASE = "/systemsetting/company";

interface RawCompanyProfile {
  legal_name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  logo_media_id: string | null;
  logo_url: string | null;
  signature_media_id: string | null;
  signature_url: string | null;
}

function mapProfile(raw: RawCompanyProfile): CompanyProfile {
  return {
    legalName: raw.legal_name,
    address: raw.address,
    city: raw.city,
    postalCode: raw.postal_code,
    phone: raw.phone,
    email: raw.email,
    logoMediaId: raw.logo_media_id,
    logoUrl: raw.logo_url,
    signatureMediaId: raw.signature_media_id,
    signatureUrl: raw.signature_url,
  };
}

function toPayload(input: SaveCompanyProfileInput) {
  return {
    legal_name: input.legalName,
    address: input.address ?? null,
    city: input.city ?? null,
    postal_code: input.postalCode ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    logo_media_id: input.logoMediaId ?? null,
    signature_media_id: input.signatureMediaId ?? null,
  };
}

export const CompanyProfileService = {
  get: async (): Promise<CompanyProfile> => {
    const res = await fetchClient<ApiResponse<RawCompanyProfile>>(BASE);
    return mapProfile(res.data);
  },

  save: async (input: SaveCompanyProfileInput): Promise<CompanyProfile> => {
    const res = await fetchClient<ApiResponse<RawCompanyProfile>>(BASE, {
      method: "POST",
      data: toPayload(input),
    });
    return mapProfile(res.data);
  },
};
