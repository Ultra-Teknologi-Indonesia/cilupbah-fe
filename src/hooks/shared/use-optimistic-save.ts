"use client";

import * as React from "react";

export function useOptimisticSave(currentUpdatedAt: string | null) {
  const ref = React.useRef<string | null>(currentUpdatedAt);

  React.useEffect(() => {
    ref.current = currentUpdatedAt;
  }, [currentUpdatedAt]);

  const buildPayload = React.useCallback(
    () => (ref.current ? { _expected_updated_at: ref.current } : {}),
    [],
  );

  return { buildPayload };
}
