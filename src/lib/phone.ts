import rawCountryCodes from "./country-codes.json";

export interface PhoneCountry {
  iso: string;
  name: string;
  dial: string;
  flag: string;
}

function flagEmoji(iso: string): string {
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1a5 + c.charCodeAt(0)));
}

const allCountries: PhoneCountry[] = (
  rawCountryCodes as { name: string; dial_code: string; code: string }[]
)
  .map((c) => ({
    iso: c.code,
    name: c.name,
    dial: c.dial_code.replace(/\D/g, ""),
    flag: flagEmoji(c.code),
  }))
  .filter((c) => c.dial.length > 0);

export const PHONE_COUNTRIES: PhoneCountry[] = [
  ...allCountries.filter((c) => c.iso === "ID"),
  ...allCountries.filter((c) => c.iso !== "ID"),
];

export const DEFAULT_DIAL = "62";

export const PHONE_E164_REGEX = /^\+[1-9]\d{6,14}$/;

export function isValidPhone(value: string): boolean {
  return PHONE_E164_REGEX.test(value);
}

const dialsByLength = PHONE_COUNTRIES.map((c) => c.dial).sort(
  (a, b) => b.length - a.length,
);

function matchDial(digits: string): string | undefined {
  return dialsByLength.find((d) => digits.startsWith(d));
}

export function findCountryByDial(dial: string): PhoneCountry | undefined {
  return PHONE_COUNTRIES.find((c) => c.dial === dial);
}

export function splitPhone(value: string): { dial: string; national: string } {
  const raw = value.trim();
  let digits = raw.replace(/\D/g, "");

  if (raw.startsWith("+")) {
    const dial = matchDial(digits);
    if (dial) return { dial, national: digits.slice(dial.length) };
    return { dial: DEFAULT_DIAL, national: digits };
  }
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
    const dial = matchDial(digits);
    if (dial) return { dial, national: digits.slice(dial.length) };
    return { dial: DEFAULT_DIAL, national: digits };
  }
  if (digits.startsWith("0")) {
    return { dial: DEFAULT_DIAL, national: digits.replace(/^0+/, "") };
  }
  if (digits.startsWith(DEFAULT_DIAL) && digits.length >= 10) {
    return { dial: DEFAULT_DIAL, national: digits.slice(DEFAULT_DIAL.length) };
  }
  return { dial: DEFAULT_DIAL, national: digits };
}

export function joinPhone(dial: string, national: string): string {
  return national ? `+${dial}${national}` : "";
}

export function maxNationalDigits(dial: string): number {
  return 15 - dial.length;
}

export function formatNationalNumber(digits: string): string {
  if (digits.length <= 3) return digits;
  const groups = [digits.slice(0, 3)];
  for (let i = 3; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join(" ");
}

export function formatPhoneDisplay(value: string | null | undefined): string {
  if (!value) return "";
  const { dial, national } = splitPhone(value);
  if (!national) return value;
  return `+${dial} ${formatNationalNumber(national)}`;
}
