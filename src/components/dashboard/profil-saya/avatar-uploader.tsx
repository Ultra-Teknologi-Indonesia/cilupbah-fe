"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRemoveAvatar, useUploadAvatar } from "@/hooks/auth/use-profile";
import { getInitials } from "@/lib/format";

const MAX_BYTES = 2 * 1024 * 1024;

interface AvatarUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUrl?: string | null;
  currentName?: string | null;
  hasAvatar: boolean;
}

export function AvatarUploader({
  open,
  onOpenChange,
  currentUrl,
  currentName,
  hasAvatar,
}: AvatarUploaderProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const busy = upload.isPending || remove.isPending;

  const previewUrl = React.useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  React.useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const resetSelection = React.useCallback(() => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) resetSelection();
    onOpenChange(next);
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      toast.error("Berkas harus berupa gambar (PNG/JPG).");
      return;
    }
    if (picked.size > MAX_BYTES) {
      toast.error("Ukuran maksimal 2MB.");
      return;
    }
    setFile(picked);
  };

  const handleSave = () => {
    if (!file) return;
    upload.mutate(file, {
      onSuccess: () => handleOpenChange(false),
    });
  };

  const handleRemove = () => {
    remove.mutate(undefined, {
      onSuccess: () => handleOpenChange(false),
    });
  };

  const displayUrl = previewUrl ?? currentUrl ?? "";
  const initials = getInitials(currentName ?? "");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ganti foto profil</DialogTitle>
          <DialogDescription>
            Format PNG atau JPG. Ukuran maksimal 2MB.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <Avatar className="size-32">
            <AvatarImage src={displayUrl} alt={currentName ?? "Foto profil"} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleSelect}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <ImagePlus className="size-4" />
            {file ? "Pilih berkas lain" : "Pilih berkas"}
          </Button>
          {file ? (
            <p className="text-xs text-muted-foreground">
              {file.name} · {(file.size / 1024).toFixed(0)} KB
            </p>
          ) : null}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {hasAvatar ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={busy}
            >
              {remove.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Hapus foto
            </Button>
          ) : (
            <span />
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={busy}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleSave} disabled={!file || busy}>
              {upload.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
