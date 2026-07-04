"use client";

import { useEffect, useState } from "react";

export function useDebouncedSearch(
  search: string,
  onDebounced?: () => void,
  delay = 300,
) {
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      onDebounced?.();
    }, delay);
    return () => clearTimeout(timer);
  }, [search, delay, onDebounced]);

  return debounced;
}
