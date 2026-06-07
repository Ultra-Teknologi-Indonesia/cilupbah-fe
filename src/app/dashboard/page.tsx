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
        {/* Placeholder cards */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Metric {i + 1}</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">123</div>
              <p className="text-xs text-muted-foreground">+20.1% dari bulan lalu</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Area Konten Utama</p>
      </div>
    </div>
  );
}
