import { fetchClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { RegionOption } from "@/types/manajemen-rak/location";

export interface CountryOption {
  id: number;
  alpha2: string;
  alpha3: string;
  name: string;
}

type RawCountry = {
  id: number | string;
  alpha2: string;
  alpha3: string;
  name: string;
};

type RawRegion = {
  id: string | number;
  nama: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
};

function toNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function mapRegion(raw: RawRegion): RegionOption {
  return {
    id: String(raw.id),
    nama: raw.nama,
    latitude: toNumber(raw.latitude),
    longitude: toNumber(raw.longitude),
  };
}

export const RegionService = {
  countries: async (search?: string): Promise<CountryOption[]> => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetchClient<ApiResponse<RawCountry[]>>(
      `/regions/countries${qs}`,
    );
    return (res.data ?? []).map((c) => ({
      id: Number(c.id),
      alpha2: c.alpha2,
      alpha3: c.alpha3,
      name: c.name,
    }));
  },

  provinces: async (): Promise<RegionOption[]> => {
    const res =
      await fetchClient<ApiResponse<RawRegion[]>>(`/regions/provinces`);
    return (res.data ?? []).map(mapRegion);
  },

  cities: async (provinceId: string): Promise<RegionOption[]> => {
    const res = await fetchClient<ApiResponse<RawRegion[]>>(
      `/regions/cities/${provinceId}`,
    );
    return (res.data ?? []).map(mapRegion);
  },

  districts: async (cityId: string): Promise<RegionOption[]> => {
    const res = await fetchClient<ApiResponse<RawRegion[]>>(
      `/regions/districts/${cityId}`,
    );
    return (res.data ?? []).map(mapRegion);
  },

  villages: async (districtId: string): Promise<RegionOption[]> => {
    const res = await fetchClient<ApiResponse<RawRegion[]>>(
      `/regions/villages/${districtId}`,
    );
    return (res.data ?? []).map(mapRegion);
  },
};
