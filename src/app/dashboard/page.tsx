export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Total Pendapatan</h3>
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">Rp 45.231.000</div>
          <p className="text-xs text-muted-foreground">+20.1% dari bulan lalu</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Pesanan Baru</h3>
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">+2350</div>
          <p className="text-xs text-muted-foreground">+180% dari bulan lalu</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Total Produk</h3>
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">12,234</div>
          <p className="text-xs text-muted-foreground">+19 produk baru hari ini</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Pelanggan Aktif</h3>
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">+573</div>
          <p className="text-xs text-muted-foreground">+201 sejak minggu lalu</p>
        </div>
      </div>
    </div>
  )
}
