export interface CompanyProfile {
  legalName: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  logoMediaId: string | null;
  logoUrl: string | null;
  signatureMediaId: string | null;
  signatureUrl: string | null;
}

export interface SaveCompanyProfileInput {
  legalName: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  logoMediaId?: string | null;
  signatureMediaId?: string | null;
}
