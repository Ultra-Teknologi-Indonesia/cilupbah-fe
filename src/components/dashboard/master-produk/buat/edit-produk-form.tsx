"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { buatProdukSchema } from "@/schemas/master-produk";
import type {
  BuatProdukFormValues,
  ProductDetail,
} from "@/types/master-produk";
import {
  detailToFormValues,
  detailVariantLocks,
} from "@/lib/master-produk/detail-to-form";
import {
  humanizeServerErrors,
  type ServerErrorItem,
} from "@/lib/master-produk/humanize-server-errors";
import { FormErrorAlert } from "@/components/dashboard/shared/form-error-alert";
import { useUpdateProduct } from "@/hooks/master-produk/use-update-product";
import { useCreateBundle } from "@/hooks/master-produk/use-create-bundle";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/dashboard/page-title";

import { SectionNav, type SectionStatus } from "./section-nav";
import {
  ProductMediaManager,
  mediaItemsFromDetail,
  type EditMediaItem,
} from "./product-media-manager";
import { FormDetailSection } from "./form-detail-section";
import { FormSalesSection } from "./form-sales-section";
import { FormShippingSection } from "./form-shipping-section";
import { FormVariantSection } from "./form-variant-section";
import { FormSectionCard } from "@/components/ui/form-section-card";

export function EditProdukForm({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [mediaItems, setMediaItems] = React.useState<EditMediaItem[]>(() => {
    if (product.media.length > 0) {
      return mediaItemsFromDetail(product.media);
    }
    const seenUrls = new Set<string>();
    const fallbackItems: EditMediaItem[] = [];
    for (const v of product.variants) {
      if (v.image && !seenUrls.has(v.image)) {
        seenUrls.add(v.image);
        fallbackItems.push({
          localId: `fallback_${fallbackItems.length}`,
          kind: "existing" as const,
          mediaType: "image" as const,
          url: v.image,
          uuid: null,
          isPrimary: v.image === product.primaryImage,
        });
      }
    }
    if (fallbackItems.length === 0 && product.primaryImage) {
      fallbackItems.push({
        localId: "fallback_primary",
        kind: "existing" as const,
        mediaType: "image" as const,
        url: product.primaryImage,
        uuid: null,
        isPrimary: true,
      });
    }
    return mediaItemsFromDetail(product.media.length > 0 ? product.media : [])
      .length > 0
      ? mediaItemsFromDetail(product.media)
      : fallbackItems;
  });

  const { mutateAsync, isPending } = useUpdateProduct(product.id);
  const { mutateAsync: saveBundle, isPending: isBundlePending } =
    useCreateBundle();
  const busy = isPending || isBundlePending;

  const isMultiVariant = product.variants.length > 1;
  const originalVariantSku = product.variants[0]?.sku;
  const detailHref = `/dashboard/produk/${product.id}`;
  const variantLocks = React.useMemo(
    () => detailVariantLocks(product),
    [product],
  );

  const form = useForm<BuatProdukFormValues>({
    resolver: zodResolver(buatProdukSchema),
    mode: "onBlur",
    defaultValues: detailToFormValues(product),
  });

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = form;
  const v = watch();

  const [serverErrors, setServerErrors] = React.useState<ServerErrorItem[]>([]);

  const applyServerErrors = (err: unknown): boolean => {
    const body = err as { message?: string; errors?: Record<string, string[]> };
    const singleVariant = form.getValues("variationTypes").length === 0;
    const { alertItems, fieldErrors, firstPath } = humanizeServerErrors(
      body?.errors,
      { singleVariant },
    );

    if (!alertItems.length) {
      if (body?.message) {
        setServerErrors([{ label: "", message: body.message }]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return true;
      }
      return false;
    }

    for (const fe of fieldErrors) {
      form.setError(fe.path as never, { type: "server", message: fe.message });
    }
    setServerErrors(alertItems);
    if (firstPath) form.setFocus(firstPath as never);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  };

  const onValid = async (data: BuatProdukFormValues) => {
    setServerErrors([]);
    try {
      if (data.isBundle) {
        await saveBundle({
          id: product.id,
          name: data.name,
          sku: data.sku?.trim() || null,
          category_id: Number(data.category!.id),
          components: (data.bundleComponents ?? []).map((c) => ({
            variant_id: c.variantId,
            qty: c.qty,
          })),
        });
        toast.success("Perubahan bundle disimpan");
        router.push(detailHref);
        return;
      }

      await mutateAsync({
        values: data,
        mediaItems,
        includeVariant: !isMultiVariant,
        originalVariantSku,
      });
      toast.success("Perubahan produk disimpan");
      router.push(detailHref);
    } catch (err) {
      const body = err as { message?: string };
      if (!applyServerErrors(err)) {
        setServerErrors([
          {
            label: "",
            message:
              body?.message || "Gagal menyimpan perubahan. Silakan coba lagi.",
          },
        ]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const onInvalid = () => {
    const order = ["detail", "penjualan", "pengiriman", "media"] as const;
    const first = order.find((id) => sectionHasError(id));
    if (first)
      document
        .getElementById(first)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast.error("Beberapa isian perlu diperbaiki");
  };

  const has = (...keys: (keyof BuatProdukFormValues)[]) =>
    keys.some((k) => errors[k]);
  function sectionHasError(id: string): boolean {
    if (id === "detail") return has("name", "sku", "category", "description");
    if (id === "penjualan") return has("sellPrice");
    if (id === "pengiriman") return has("weight");
    return false;
  }
  function sectionStatus(id: string): SectionStatus {
    if (sectionHasError(id)) return "error";
    if (id === "detail") return v.name && v.category ? "valid" : "empty";
    if (id === "varian") return "valid";
    if (id === "penjualan") return v.sellPrice ? "valid" : "empty";
    if (id === "pengiriman") return v.weight ? "valid" : "empty";
    if (id === "media") return mediaItems.length > 0 ? "valid" : "empty";
    return "empty";
  }

  const sections = [
    { id: "detail", label: "Detail Produk", status: sectionStatus("detail") },
    ...(product.isBundle
      ? []
      : [{ id: "varian", label: "Varian", status: sectionStatus("varian") }]),
    {
      id: "penjualan",
      label: "Penjualan & Pembelian",
      status: sectionStatus("penjualan"),
    },
    {
      id: "pengiriman",
      label: "Pengiriman",
      status: sectionStatus("pengiriman"),
    },
    { id: "media", label: "Gambar & Video", status: sectionStatus("media") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Edit Produk"
        description={product.name}
        backHref={detailHref}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produk Master", href: "/dashboard/produk" },
          { label: product.name, href: detailHref },
          { label: "Edit" },
        ]}
        actions={
          <Button
            variant="primary"
            onClick={() => !busy && handleSubmit(onValid, onInvalid)()}
            disabled={busy}
          >
            {busy ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            Simpan perubahan
          </Button>
        }
      />

      <FormErrorAlert
        items={serverErrors}
        onDismiss={() => setServerErrors([])}
      />

      {product.status === "master" && (
        <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          Produk berstatus Master — perubahan langsung berlaku di katalog &
          channel.
        </div>
      )}

      {isMultiVariant && (
        <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground/80">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          Produk ini memiliki {product.variants.length} varian. Harga tiap
          varian diatur di step Varian (kolom Harga Jual); harga jual default di
          bawah dipakai untuk varian yang harganya belum diisi.
        </div>
      )}

      <div
        className={cn(
          "grid gap-6",
          !product.isBundle && "lg:grid-cols-[14rem_1fr]",
        )}
      >
        {!product.isBundle && (
          <aside className="hidden lg:block">
            <Card className="sticky top-6 gap-0 px-2 py-4 backdrop-blur-xl">
              <SectionNav sections={sections} />
            </Card>
          </aside>
        )}

        <Form {...form}>
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <FormDetailSection mode={product.isBundle ? "bundle" : "full"} />

            {!product.isBundle && (
              <>
                <FormVariantSection
                  lockedTypeIds={variantLocks.lockedTypeIds}
                />
                <FormSalesSection />
                <FormShippingSection />
                <FormSectionCard id="media" title="Gambar & Video Produk">
                  <ProductMediaManager
                    value={mediaItems}
                    onChange={setMediaItems}
                  />
                </FormSectionCard>
              </>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
