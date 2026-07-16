"use client";

import * as React from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PHONE_COUNTRIES,
  type PhoneCountry,
  findCountryByDial,
  formatNationalNumber,
  joinPhone,
  maxNationalDigits,
  splitPhone,
} from "@/lib/phone";

interface PhoneInputProps {
  /** Nilai E.164, mis. "+628123456789". String kosong = belum diisi. */
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  disabled,
  id,
  invalid,
  placeholder = "812 3456 7890",
  className,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIso, setSelectedIso] = React.useState(PHONE_COUNTRIES[0].iso);

  const selected =
    PHONE_COUNTRIES.find((c) => c.iso === selectedIso) ?? PHONE_COUNTRIES[0];
  const parsed = value ? splitPhone(value) : null;
  const dial = parsed?.dial ?? selected.dial;
  const national = parsed?.national ?? "";

  const country =
    selected.dial === dial ? selected : (findCountryByDial(dial) ?? selected);

  if (country.iso !== selectedIso) {
    setSelectedIso(country.iso);
  }

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? PHONE_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(trimmed) ||
          c.dial.includes(trimmed.replace(/^\+/, "")),
      )
    : PHONE_COUNTRIES;

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value
      .replace(/\D/g, "")
      .replace(/^0+/, "")
      .slice(0, maxNationalDigits(dial));
    onChange(joinPhone(dial, digits));
  }

  function handleSelectCountry(next: PhoneCountry) {
    setSelectedIso(next.iso);
    onChange(
      joinPhone(next.dial, national.slice(0, maxNationalDigits(next.dial))),
    );
    setOpen(false);
  }

  return (
    <InputGroup
      className={cn("bg-background border-border", className)}
      data-disabled={disabled || undefined}
    >
      <InputGroupAddon align="inline-start" className="py-0">
        <Popover
          modal={true}
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (o) setQuery("");
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label="Pilih kode negara"
              className={cn(
                "flex h-7 shrink-0 items-center gap-1 rounded-full px-1.5 text-sm text-foreground outline-none transition-colors",
                "hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/30",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <span aria-hidden>{country.flag}</span>
              <span className="tabular-nums">+{country.dial}</span>
              <ChevronDownIcon className="size-3.5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 gap-0 p-0">
            <div className="flex items-center gap-2 border-b border-border/60 px-3">
              <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari negara atau kode"
                className="h-10 border-0 bg-transparent px-0 focus-visible:ring-0"
              />
            </div>
            <div
              className="max-h-64 overflow-y-auto overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <ul className="p-1.5">
                {filtered.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Tidak ditemukan.
                  </li>
                )}
                {filtered.map((c) => {
                  const active = c.iso === country.iso;
                  return (
                    <li key={c.iso}>
                      <button
                        type="button"
                        onClick={() => handleSelectCountry(c)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-full px-2.5 py-2 text-left text-sm transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/60",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <CheckIcon
                            className={cn(
                              "size-4 shrink-0",
                              active ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span aria-hidden>{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          +{c.dial}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={formatNationalNumber(national)}
        onChange={handleNumberChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid || undefined}
      />
    </InputGroup>
  );
}
