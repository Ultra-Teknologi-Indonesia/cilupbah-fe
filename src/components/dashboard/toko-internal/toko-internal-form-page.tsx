"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, Trash2Icon, UploadIcon } from "lucide-react";

import { PageTitle } from "@/components/dashboard/page-title";
import { FormFooter } from "@/components/dashboard/shared/form-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  useCreateInternalStore,
  useDeleteInternalStoreLogo,
  useInternalStore,
  useUpdateInternalStore,
} from "@/hooks/penjualan/use-internal-stores";

interface Props {
  mode: "create" | "edit";
  id?: string;
}

const ACCEPTS = "image/png,image/jpeg,image/webp,image/svg+xml";
const MAX_MB = 2;

export function TokoInternalFormPage({ mode, id }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const { data: existing, isLoading: loadingDetail } = useInternalStore(
    isEdit ? id : undefined,
  );

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setIsActive(existing.is_active);
      setExistingLogo(existing.logo_thumb ?? existing.logo_url ?? null);
    }
  }, [existing]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const createMut = useCreateInternalStore();
  const updateMut = useUpdateInternalStore();
  const deleteLogoMut = useDeleteInternalStoreLogo();

  const submitting = createMut.isPending || updateMut.isPending;
  const disabled = submitting || (isEdit && loadingDetail);

  function handlePickFile(files: FileList | null) {
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Ukuran file maksimal ${MAX_MB} MB`);
      return;
    }
    setLogoFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (isEdit && id) {
      await updateMut.mutateAsync({
        id,
        data: { name: name.trim(), is_active: isActive },
        logo: logoFile,
      });
    } else {
      await createMut.mutateAsync({
        data: { name: name.trim(), is_active: isActive },
        logo: logoFile,
      });
    }
    router.push("/dashboard/toko-internal");
  }

  const previewSrc = logoPreview ?? existingLogo;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PageTitle
        title={isEdit ? "Ubah Toko Internal" : "Tambah Toko Internal"}
        backHref="/dashboard/toko-internal"
        breadcrumb={[
          { label: "Penjualan" },
          { label: "Toko Internal", href: "/dashboard/toko-internal" },
          { label: isEdit ? "Ubah" : "Tambah" },
        ]}
      />

      <LiquidGlass radius={16} className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">
                Nama Toko <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Toko Grosir Reseller Cilupbah"
                autoFocus
                required
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <div>
                <div className="text-sm font-medium">Status Aktif</div>
                <div className="text-xs text-muted-foreground">
                  Toko nonaktif tidak akan muncul di pilihan form pesanan.
                </div>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={disabled}
              />
            </div>

            {isEdit && existing?.code && (
              <div className="text-xs text-muted-foreground">
                Kode toko: <span className="font-mono">{existing.code}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Logo</Label>
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/30 p-6 text-center",
                previewSrc && "border-solid bg-transparent",
              )}
            >
              {previewSrc ? (
                <>
                  <div className="relative size-32 overflow-hidden rounded-lg border border-border">
                    <Image
                      src={previewSrc}
                      alt="Logo preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => inputRef.current?.click()}
                      disabled={disabled}
                    >
                      <UploadIcon className="mr-1 size-4" />
                      Ganti
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLogoFile(null);
                        if (isEdit && id && existingLogo && !logoFile) {
                          deleteLogoMut.mutate(id, {
                            onSuccess: () => setExistingLogo(null),
                          });
                        }
                      }}
                      disabled={disabled}
                    >
                      <Trash2Icon className="mr-1 size-4" />
                      Hapus
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="size-10 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    PNG · JPG · WEBP · SVG (maks {MAX_MB} MB)
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                  >
                    <UploadIcon className="mr-1 size-4" />
                    Pilih Logo
                  </Button>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTS}
                className="hidden"
                onChange={(e) => handlePickFile(e.target.files)}
              />
            </div>
          </div>
        </div>
      </LiquidGlass>

      <FormFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/toko-internal")}
          disabled={submitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={disabled || !name.trim()}>
          {submitting ? "Menyimpan…" : "Simpan"}
        </Button>
      </FormFooter>
    </form>
  );
}
