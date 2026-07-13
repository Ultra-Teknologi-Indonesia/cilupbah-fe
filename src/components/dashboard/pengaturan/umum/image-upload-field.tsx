"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMediaUpload } from "@/hooks/media/use-media-upload";
import { cn } from "@/lib/utils";

const MAX_BYTES = 2 * 1024 * 1024;

interface ImageUploadFieldProps {
  label: string;
  hint?: string;
  url: string | null;
  onChange: (media: { uuid: string; url: string } | null) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUploadField({
  label,
  hint,
  url,
  onChange,
  disabled,
  className,
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const upload = useMediaUpload();
  const uploading = upload.isPending;

  const handleSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const picked = event.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!picked) return;

    if (!picked.type.startsWith("image/")) {
      toast.error("Berkas harus berupa gambar (PNG/JPG).");
      return;
    }
    if (picked.size > MAX_BYTES) {
      toast.error("Ukuran maksimal 2MB.");
      return;
    }

    try {
      const media = await upload.mutateAsync(picked);
      onChange(media);
    } catch {
      toast.error("Gagal mengunggah berkas.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={label}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleSelect}
            disabled={disabled || uploading}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {url ? "Ganti" : "Unggah"}
            </Button>
            {url ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onChange(null)}
                disabled={disabled || uploading}
              >
                <Trash2 className="size-4" />
                Hapus
              </Button>
            ) : null}
          </div>
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
