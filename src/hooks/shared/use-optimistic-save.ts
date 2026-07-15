"use client";

import * as React from "react";

/**
 * Simpel state guard untuk cegah race 2 admin edit dokumen bareng (fix H4).
 *
 * Pola:
 *   const optimistic = useOptimisticSave(inbound?.updated_version_at ?? null);
 *   await mutation.mutateAsync({ ...payload, ...optimistic.buildPayload() });
 *
 * `buildPayload()` mengembalikan `{ _expected_updated_at: "<iso>" }` yang bisa
 * di-spread ke body request. BE trait `assertVersionMatches` cek nilainya,
 * kalau beda dari `updated_version_at` DB → throw StaleWriteException (412).
 *
 * Kalau BE respon 412 dengan code `STALE_WRITE`, caller wajib refetch data
 * (react-query invalidateQueries) dan tampilkan toast "Data sudah berubah".
 * Ini bukan tanggung jawab hook — dilakukan di mutation.onError.
 */
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
