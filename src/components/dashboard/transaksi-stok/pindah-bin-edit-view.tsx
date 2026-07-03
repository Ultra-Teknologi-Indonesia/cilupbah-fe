"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InfoIcon, Loader2Icon, PackageSearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/dashboard/page-title";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import {
  useBinTransferDetail,
  useBinTransferUpdate,
} from "@/hooks/transaksi-stok/use-bin-transfer";

export function PindahBinEditView({ id }: { id: string }) {
  const router = useRouter();
  const listHref = "/dashboard/transaksi-stok?tab=transfer";
  const detailHref = `/dashboard/transaksi-stok/pindah-bin/${id}`;

  const { data: trf, isLoading } = useBinTransferDetail(id);
  const updateMut = useBinTransferUpdate(id);

  const [transferDate, setTransferDate] = useState<Date | undefined>(undefined);
  const [createdBy, setCreatedBy] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (trf) {
      const raw = (trf.transfer_date ?? "").slice(0, 10);
      setTransferDate(raw ? new Date(`${raw}T00:00:00`) : undefined);
      setCreatedBy(trf.created_by ?? "");
      setNotes(trf.notes ?? "");
    }
  }, [trf]);

  const toDateString = (d?: Date): string | undefined => {
    if (!d) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!trf) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <PackageSearchIcon className="h-10 w-10" />
        <p className="text-sm">Pindah bin tidak ditemukan.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href={listHref}>Kembali</Link>
        </Button>
      </div>
    );
  }

  const canSubmit =
    !!transferDate && !!createdBy.trim() && !updateMut.isPending;

  const handleSave = () => {
    updateMut.mutate(
      {
        transfer_date: toDateString(transferDate),
        created_by: createdBy.trim(),
        notes: notes.trim() || null,
      },
      { onSuccess: () => router.push(detailHref) },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title={`Edit ${trf.transfer_number}`}
        backHref={detailHref}
        breadcrumb={[
          { label: "Persediaan" },
          { label: "Transaksi Stok", href: listHref },
          { label: "Internal Transfer", href: listHref },
          { label: trf.transfer_number, href: detailHref },
          { label: "Edit" },
        ]}
      />

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium">Hanya metadata yang dapat diubah</p>
          <p className="text-xs text-muted-foreground">
            Untuk mengubah rak asal/tujuan, produk, atau qty, buat pindah bin
            baru dengan arah kebalikan lalu susun pindah bin baru.
          </p>
        </div>
      </div>

      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">No. Pindah Bin</Label>
              <Input
                value={trf.transfer_number}
                readOnly
                className="bg-muted/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                value={transferDate}
                onChange={setTransferDate}
                placeholder="Pilih tanggal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Lokasi</Label>
              <Input
                value={trf.location?.location_name ?? "—"}
                readOnly
                className="bg-muted/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Rak Asal</Label>
                <Input
                  value={trf.source_bin?.bin_final_code ?? "—"}
                  readOnly
                  className="bg-muted/40"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Rak Tujuan</Label>
                <Input
                  value={trf.destination_bin?.bin_final_code ?? "—"}
                  readOnly
                  className="bg-muted/40"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Dipindahkan Oleh <span className="text-red-500">*</span>
              </Label>
              <UserSelect
                value={createdBy}
                onChange={setCreatedBy}
                placeholder="Pilih petugas"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label className="text-sm font-medium">Keterangan</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Masukkan Keterangan"
                rows={8}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </LiquidGlass>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push(detailHref)}>
          Batal
        </Button>
        <Button onClick={handleSave} disabled={!canSubmit}>
          {updateMut.isPending && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Simpan
        </Button>
      </div>
    </div>
  );
}
