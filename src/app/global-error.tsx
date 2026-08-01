"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            fontFamily: "system-ui, sans-serif",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Terjadi kesalahan
          </h2>
          <p style={{ color: "#6b7280", maxWidth: "28rem" }}>
            Maaf, terjadi kendala tak terduga. Silakan coba lagi. Jika berlanjut,
            laporkan ke admin/developer.
          </p>
          <button
            onClick={() => reset()}
            style={{
              borderRadius: "9999px",
              border: "1px solid #d1d5db",
              padding: "0.5rem 1.25rem",
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
