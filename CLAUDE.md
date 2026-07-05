@AGENTS.md

## Bahasa visual (wajib untuk kode UI)

Sebelum menulis/menyunting UI, ikuti `docs/design-rules.md` (konstitusi desain anti-slop): status → `StatusBadge`+`lib/status.ts`, warna semantik → token (`success`/`warning`/`destructive`/`muted-foreground`), radius dua tier (`rounded-full` interaktif, `rounded-4xl` permukaan, `rounded-xl` tile), ikon `size-*` lucide, empty state → `EmptyState`, spinner → `Loader2`. Jangan meracik warna/shape/glass sendiri. Roadmap lengkap: `PLANNING-DESIGN-CONSISTENCY.md`.
