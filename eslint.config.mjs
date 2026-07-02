import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Komponen tidak boleh memanggil service langsung — akses data lewat layer
  // hooks (react-query) agar caching/invalidations konsisten. Masih "warn"
  // karena ada pelanggar lama (lihat AUDIT-FE.md §2); jangan tambah baru.
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/services/*"],
              message:
                "Komponen jangan impor service langsung — bungkus di hook @/hooks/* (react-query).",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // PDF.js worker disalin dari pdfjs-dist; bukan source kita.
    "public/pdf.worker.min.mjs",
  ]),
]);

export default eslintConfig;
