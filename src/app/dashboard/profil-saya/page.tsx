import { ProfilSayaShell } from "@/components/dashboard/profil-saya/profil-saya-shell";
import packageJson from "../../../../package.json";

const APP_VERSION = `v${packageJson.version}`;

export default function ProfilSayaPage() {
  return <ProfilSayaShell version={APP_VERSION} />;
}
