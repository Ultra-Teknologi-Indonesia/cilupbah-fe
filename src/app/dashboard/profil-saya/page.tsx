import { ProfilSayaShell } from "@/components/dashboard/profil-saya/profil-saya-shell";
import packageJson from "../../../../package.json";

// Dibaca di Server Component (tidak sampai ke bundle klien selain string versi).
// package.json disinkronkan ke tag rilis oleh CI — jadi tanpa env var.
const APP_VERSION = `v${packageJson.version}`;

export default function ProfilSayaPage() {
  return <ProfilSayaShell version={APP_VERSION} />;
}
