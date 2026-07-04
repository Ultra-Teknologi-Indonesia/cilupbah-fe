import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/dashboard/page-title";
import { TokoInternalView } from "@/components/dashboard/toko-internal/toko-internal-view";

export default function TokoInternalPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Toko Internal"
        description="Kelola toko internal untuk penjualan manual di luar marketplace."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Penjualan" },
          { label: "Toko Internal" },
        ]}
        actions={
          <Button asChild variant="primary">
            <Link href="/dashboard/toko-internal/tambah">
              <PlusIcon className="mr-1 size-4" />
              Tambah Toko
            </Link>
          </Button>
        }
      />

      <TokoInternalView />
    </div>
  );
}
