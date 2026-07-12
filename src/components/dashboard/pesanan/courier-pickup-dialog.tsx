"use client";

import * as React from "react";
import { Loader2Icon, UploadIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CourierPickup } from "@/types/pesanan/order";
import {
  useSaveCourierPickup,
  useUploadCourierIdPhoto,
  useDeleteCourierIdPhoto,
} from "@/hooks/pesanan/use-order-actions";

interface CourierPickupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNo: string;
  pickup?: CourierPickup | null;
}

const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // 4MB, samakan dengan validasi BE

export function CourierPickupDialog({
  open,
  onOpenChange,
  orderId,
  orderNo,
  pickup,
}: CourierPickupDialogProps) {
  const [courierName, setCourierName] = React.useState("");
  const [courierPhone, setCourierPhone] = React.useState("");
  const [pickupCode, setPickupCode] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const save = useSaveCourierPickup();
  const uploadPhoto = useUploadCourierIdPhoto();
  const deletePhoto = useDeleteCourierIdPhoto();
  const loading =
    save.isPending || uploadPhoto.isPending || deletePhoto.isPending;

  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevPickup, setPrevPickup] = React.useState(pickup);
  if (open !== prevOpen || pickup !== prevPickup) {
    setPrevOpen(open);
    setPrevPickup(pickup);
    if (open) {
      setCourierName(pickup?.courier_name ?? "");
      setCourierPhone(pickup?.courier_phone ?? "");
      setPickupCode(pickup?.pickup_code ?? "");
      setFile(null);
      setPreviewUrl(null);
    }
  }

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (picked.size > MAX_PHOTO_BYTES) {
      alert("Ukuran foto maksimal 4MB.");
      e.target.value = "";
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  };

  const clearPickedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    await save.mutateAsync({
      orderId,
      courier_name: courierName.trim() || null,
      courier_phone: courierPhone.trim() || null,
      pickup_code: pickupCode.trim() || null,
    });

    if (file) {
      await uploadPhoto.mutateAsync({ orderId, file });
    }

    onOpenChange(false);
  };

  const handleRemoveExistingPhoto = async () => {
    await deletePhoto.mutateAsync({ orderId });
  };

  const existingPhoto = pickup?.id_photo_url ?? null;

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bukti Pickup Kurir</DialogTitle>
          <DialogDescription>
            Catat identitas kurir yang mengambil pesanan{" "}
            <span className="font-medium">{orderNo}</span> dan lampirkan foto
            kartu identitasnya.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="courier-name">Nama Kurir</Label>
            <Input
              id="courier-name"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="mis. Budi Santoso"
              maxLength={255}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="courier-phone">No. Telepon Kurir</Label>
            <Input
              id="courier-phone"
              type="tel"
              inputMode="tel"
              value={courierPhone}
              onChange={(e) => setCourierPhone(e.target.value)}
              placeholder="mis. 0812-3456-7890"
              maxLength={32}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pickup-code">Kode Pengambilan</Label>
            <Input
              id="pickup-code"
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value)}
              placeholder="mis. PIN / kode dari channel"
              maxLength={64}
              className="font-mono"
            />
          </div>

          <div className="grid gap-2">
            <Label>Foto Identitas Kurir</Label>

            {previewUrl ? (
              <div className="relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Pratinjau foto identitas kurir"
                  className="h-40 w-auto rounded-xl border border-border/60 object-cover"
                />
                <button
                  type="button"
                  onClick={clearPickedFile}
                  className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow"
                  aria-label="Hapus foto terpilih"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            ) : existingPhoto ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pickup?.id_photo_thumb ?? existingPhoto}
                  alt="Foto identitas kurir"
                  className="h-16 w-16 rounded-xl border border-border/60 object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive"
                  onClick={handleRemoveExistingPhoto}
                  disabled={loading}
                >
                  <XIcon className="size-3.5" />
                  Hapus foto
                </Button>
              </div>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePickFile}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <UploadIcon className="size-3.5" />
              {existingPhoto || previewUrl ? "Ganti Foto" : "Pilih Foto"}
            </Button>
            <p className="text-2xs text-muted-foreground">
              Format PNG/JPG/WEBP, maksimal 4MB.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2Icon className="animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
