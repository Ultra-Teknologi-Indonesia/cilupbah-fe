import { Metadata } from "next";
import { PenerimaanTransferDetailView } from "@/components/dashboard/transaksi-stok/penerimaan-transfer-detail-view";

export const metadata: Metadata = {
  title: "Detail Penerimaan Transfer Internal",
  description: "Melihat detail barang yang diterima dari transfer stok",
};

export default function PenerimaanTransferDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <PenerimaanTransferDetailView id={params.id} />;
}
