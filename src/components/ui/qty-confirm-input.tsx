"use client";

import * as React from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface QtyConfirmInputProps {
  value: number | "";
  expected: number;
  max: number;
  min?: number;
  onChange: (v: number | "") => void;
  onEnter: () => void;
  onOverQty?: () => void;
  autoSelectOnFocus?: boolean;
  autoFocus?: boolean;
  allowOverWithConfirm?: boolean;

  warnOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

export function QtyConfirmInput({
  value,
  expected,
  max,
  min = 0,
  onChange,
  onEnter,
  onOverQty,
  autoSelectOnFocus = true,
  autoFocus,
  allowOverWithConfirm = false,
  warnOnly = false,
  disabled,
  placeholder,
  className,
  inputRef,
}: QtyConfirmInputProps) {
  const [pendingOverConfirm, setPendingOverConfirm] = React.useState(false);

  const displayValue = value === "" ? "" : String(value);

  const numeric = value === "" ? 0 : value;
  const matchesExpected = numeric === expected && expected > 0;
  const overMax = numeric > max;
  const underMin = numeric > 0 && numeric < min;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange("");
      setPendingOverConfirm(false);
      return;
    }
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    if (warnOnly || allowOverWithConfirm) {
      onChange(Math.max(min, n));
    } else {
      onChange(Math.max(min, Math.min(max, n)));
    }
    setPendingOverConfirm(false);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (autoSelectOnFocus) e.currentTarget.select();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (value === "" || numeric <= 0) {
      toast.error("Masukkan qty yang valid.");
      return;
    }
    if (numeric > max && !warnOnly) {
      if (allowOverWithConfirm) {
        if (!pendingOverConfirm) {
          setPendingOverConfirm(true);
          onOverQty?.();
          toast.warning(
            `Qty ${numeric} melebihi maksimum (${max}). Enter lagi untuk terima sebagai discrepancy.`,
          );
          return;
        }
      } else {
        toast.error(`Qty melebihi maksimum (${max}).`);
        return;
      }
    }
    setPendingOverConfirm(false);
    onEnter();
  };

  return (
    <Input
      ref={inputRef}
      type="number"
      inputMode="numeric"
      min={min}
      max={warnOnly || allowOverWithConfirm ? undefined : max}
      value={displayValue}
      placeholder={placeholder ?? String(expected)}
      disabled={disabled}
      autoFocus={autoFocus}
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className={cn(
        "tabular-nums",
        matchesExpected && "border-primary/40 ring-1 ring-primary/20",
        overMax && warnOnly && "border-amber-500 ring-1 ring-amber-500/40",
        overMax &&
          !warnOnly &&
          !pendingOverConfirm &&
          "border-destructive ring-1 ring-destructive/30",
        overMax &&
          !warnOnly &&
          pendingOverConfirm &&
          "border-amber-500 ring-1 ring-amber-500/40",
        underMin && "border-destructive ring-1 ring-destructive/30",
        className,
      )}
    />
  );
}
