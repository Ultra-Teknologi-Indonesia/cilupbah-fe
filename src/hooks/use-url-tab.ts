"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlTab<T extends string>(
  key: string,
  defaultValue: T,
  options?: {
    validValues?: readonly T[];
    clearKeys?: readonly string[];
  },
): [T, (value: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { validValues, clearKeys } = options ?? {};
  
  // Need this to stabilize dependency array
  const clearKeysKey = JSON.stringify(clearKeys);

  const raw = searchParams.get(key);
  const urlValue =
    raw && (!validValues || (validValues as readonly string[]).includes(raw))
      ? (raw as T)
      : defaultValue;

  const [localValue, setLocalValue] = useState<T>(urlValue);

  useEffect(() => {
    setLocalValue(urlValue);
  }, [urlValue]);

  const setValue = useCallback(
    (next: T) => {
      setLocalValue(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, next);
      }
      // Re-parse clearKeys from clearKeysKey inside the callback to avoid stale closures if options object changes
      const parsedClearKeys = clearKeysKey ? JSON.parse(clearKeysKey) as string[] : [];
      for (const k of parsedClearKeys) params.delete(k);
      
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [
      router,
      pathname,
      searchParams,
      key,
      defaultValue,
      clearKeysKey,
    ],
  );

  return [localValue, setValue];
}
