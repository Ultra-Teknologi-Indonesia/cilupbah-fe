import { LiquidGlass } from "@/components/ui/liquid-glass";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Selamat datang di halaman dashboard. Ini adalah tampilan awal dengan struktur layout utama dan sidebar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LiquidGlass
            key={i}
            radius={20}
            intensity="default"
            className="bg-white/40 dark:bg-white/[0.06]"
          >
            <div className="flex flex-row items-center justify-between p-6 pb-2">
              <h2 className="text-sm font-medium tracking-tight">Metric {i + 1}</h2>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">123</div>
              <p className="text-xs text-muted-foreground">+20.1% dari bulan lalu</p>
            </div>
          </LiquidGlass>
        ))}
      </div>

      <LiquidGlass
        radius={24}
        intensity="default"
        className="flex h-[400px] items-center justify-center bg-white/40 dark:bg-white/[0.06]"
      >
        <p className="text-muted-foreground">Area Konten Utama</p>
      </LiquidGlass>
    </div>
  );
}
