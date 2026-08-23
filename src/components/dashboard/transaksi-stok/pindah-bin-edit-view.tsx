"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InfoIcon, Loader2Icon, PackageSearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/dashboard/page-title";
import { FormFooter } from "@/components/dashboard/shared/form-footer";
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

  const [prevTrf, setPrevTrf] = useState(trf);
  if (trf !== prevTrf) {
    setPrevTrf(trf);
    if (trf) {
      const raw = (trf.transfer_date ?? "").slice(0, 10);
      setTransferDate(raw ? new Date(`${raw}T00:00:00`) : undefined);
      setCreatedBy(trf.created_by ?? "");
      setNotes(trf.notes ?? "");
    }
  }

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
        <PackageSearchIcon className="size-10" />
        <p className="text-sm">Transfer internal tidak ditemukan.</p>
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
          { label: "Transfer Internal", href: listHref },
          { label: trf.transfer_number, href: detailHref },
          { label: "Edit" },
        ]}
      />

      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
        <InfoIcon className="mt-0.5 size-5 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-medium">
            Hanya metadata yang dapat diubah
          </p>
          <p className="text-xs text-muted-foreground">
            Untuk mengubah rak asal/tujuan, produk, atau qty, buat transfer
            internal baru dengan arah kebalikan lalu susun transfer internal
            baru.
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
              <Label className="text-sm font-medium">
                No. Transfer Internal
              </Label>
              <Input
                value={trf.transfer_number}
                readOnly
                className="bg-muted/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Tanggal <span className="text-destructive">*</span>
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
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Jumlah Item</Label>
              <Input
                value={String(trf.items?.length ?? 0)}
                readOnly
                className="bg-muted/40"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Dibuat Oleh <span className="text-destructive">*</span>
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

      <FormFooter>
        <Button variant="outline" onClick={() => router.push(detailHref)}>
          Batal
        </Button>
        <Can permission="edit-pindah-bin">
          <Button onClick={handleSave} disabled={!canSubmit}>
            {updateMut.isPending && (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            )}
            Simpan
          </Button>
        </Can>
      </FormFooter>
    </div>
  );
}
