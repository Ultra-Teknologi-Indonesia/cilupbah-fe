import { cn } from "@/lib/utils";

// `version` dibaca dari package.json di Server Component (lihat page Profil
// Saya) lalu diteruskan sebagai prop — tanpa env var. package.json disinkronkan
// ke tag rilis oleh CI, jadi Vercel/VPS/lokal menampilkan versi yang sama.
export function AppVersion({
  version,
  className,
}: {
  version: string;
  className?: string;
}) {
  return (
    <p className={cn("text-center text-xs text-muted-foreground", className)}>
      Cilupbah Superapps · {version}
    </p>
  );
}
