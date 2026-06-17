import { redirect } from "next/navigation"

export default function ManajemenRakPage() {
  // Sub-menu default: Lokasi Gudang.
  redirect("/dashboard/manajemen-rak/lokasi")
}
